using System;
using System.Threading.Tasks;
using Maelstorm.Crypto.Implementations;
using Maelstorm.Crypto.Interfaces;
using Maelstorm.Database;
using Maelstorm.Services.Implementations;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Maelstorm.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Maelstorm.Hubs;
using Microsoft.Extensions.Caching.Distributed;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace Maelstorm
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();
            services.Configure<JwtOptions>(Configuration);

            services.AddDbContext<MaelstormRepository, MaelstormContext>();

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<IAuthenticationService, AuthenticationService>();
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IDialogService, DialogService>();
            services.AddScoped<ISQLService, SQLService>();
            services.AddScoped<IFinderService, FinderService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ISessionService, SessionService>();
            services.AddScoped<ISignalRSessionService, SignalRSessionService>();

            #region Jwt / session validation

            services.Configure<JwtOptions>(Configuration.GetSection("Jwt"));

            string signingSecurityKey = Configuration["Jwt:SigningKey"];
            var signingKey = new SigningSymmetricKey(signingSecurityKey);
            services.AddSingleton<ISigningKeys>(signingKey);

            string encodingSecurityKey = Configuration["Jwt:EncryptingKey"];
            var encryptionEncodingKey = new EncryptingSymmetricKey(encodingSecurityKey);
            services.AddSingleton<IEncryptingKeys>(encryptionEncodingKey);

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            // раскоментить при ошибках с jwt и всякого рода шифрования, чтобы видеть инфу об ошибке
            //IdentityModelEventSource.ShowPII = true;

            const string jwtSchemeName = "JwtBearer";
            IJwtSigningDecodingKey signingDecodingKey = (IJwtSigningDecodingKey)signingKey;
            IJwtEncryptingDecodingKey encryptingDecodingKey = (IJwtEncryptingDecodingKey)encryptionEncodingKey;
            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = jwtSchemeName;
                    options.DefaultChallengeScheme = jwtSchemeName;
                })
                .AddJwtBearer(jwtSchemeName, jwtBearerOptions =>
                {
                    jwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = signingDecodingKey.GetKey(),
                        TokenDecryptionKey = encryptingDecodingKey.GetKey(),

                        ValidateIssuer = true,
                        ValidIssuer = Configuration["Jwt:Issuer"],

                        ValidateAudience = true,
                        ValidAudience = Configuration["Jwt:Audience"],

                        ValidateLifetime = true,

                        ClockSkew = TimeSpan.FromSeconds(Int32.Parse(Configuration["Jwt:ClockSkew"]))
                    };

                    jwtBearerOptions.Events = new JwtBearerEvents
                    {
                        OnAuthenticationFailed = context =>
                        {
                            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                            {
                                context.Response.Headers.Add("Token-Expired", "true");
                            }
                            return Task.CompletedTask;
                        },
                        OnTokenValidated = async context =>
                        {
                            var sessionService = context.HttpContext.RequestServices.GetService<ISessionService>();
                            if (await sessionService.IsSessionClosed(context.Principal.FindFirst("SessionId")?.Value)
                                || context.Principal.FindFirst("Ip")?.Value != context.HttpContext.Connection.RemoteIpAddress.ToString())
                            {
                                context.Fail("Invalid session");
                            }
                        }
                    };
                });

            #endregion

            services.AddDistributedRedisCache(option =>
            {
                option.Configuration = Configuration["Redis:Address"];
                option.InstanceName = "maelstorm";
            });

            services.AddSignalR();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime applicationLifetime)
        {
            applicationLifetime.ApplicationStopping.Register(OnShutdown);
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseAuthentication();
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.Use(async (context, next) =>
            {
                context.Response.Headers.Add("Content-Security-Policy",
                    $"default-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com https://ajax.googleapis.com https://ajax.aspnetcdn.com https://stackpath.bootstrapcdn.com https://cdnjs.cloudflare.com https://code.jquery.com; base-uri 'self'; report-uri /event/cspreport");
                context.Response.Headers.Add("x-xss-protection", "1; mode=block");
                context.Response.Headers.Add("X-Frame-Options", "DENY");
                context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
                await next();
            });

            app.UseSignalR(routes =>
            {
                routes.MapHub<MessageHub>("/messageHub");
            });

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}");
            });
        }

        private void OnShutdown()
        {
            if(RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                ExecuteCommand("redis-cli flushall");            
        }

        public void ExecuteCommand(string command)
        {
            Process proc = new System.Diagnostics.Process();
            proc.StartInfo.FileName = "/bin/bash";
            proc.StartInfo.Arguments = "-c \" " + command + " \"";
            proc.StartInfo.UseShellExecute = false;
            proc.StartInfo.RedirectStandardOutput = true;
            proc.Start();
            Console.Write("Execution result: ");
            while (!proc.StandardOutput.EndOfStream)
            {
                Console.WriteLine(proc.StandardOutput.ReadLine());
            }
        }
    }
}
