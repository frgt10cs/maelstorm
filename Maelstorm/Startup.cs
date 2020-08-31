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
using StackExchange.Redis.Extensions.Core.Abstractions;
using StackExchange.Redis.Extensions.Newtonsoft;
using StackExchange.Redis.Extensions.Core.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Logging;

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

            services.AddDbContext<MaelstormContext>(options =>
                    options.UseSqlServer(Configuration.GetConnectionString("MaelstormDatabase"))); ;

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<IAuthenticationService, AuthenticationService>();
            services.AddScoped<IAccountService, AccountService>();            
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IDialogService, DialogService>();
            services.AddScoped<ISQLService, SQLService>();
            //services.AddScoped<ISQLService, SQLiteService>();            
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ISessionService, SessionService>();
            services.AddScoped<ISignalRSessionService, SignalRSessionService>();
            services.AddScoped<ICryptographyService, CryptographyService>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<INotificationService, NotificationService>();

            services.AddCors();

            #region Jwt / session validation

            services.Configure<JwtOptions>(Configuration.GetSection("Jwt"));

            string signingSecurityKey = Configuration["Jwt:SigningKey"];
            var signingKey = new SigningSymmetricKey(signingSecurityKey);
            services.AddSingleton<ISigningKeys>(signingKey);

            string encodingSecurityKey = Configuration["Jwt:EncryptingKey"];
            var encryptionEncodingKey = new EncryptingSymmetricKey(encodingSecurityKey);
            services.AddSingleton<IEncryptingKeys>(encryptionEncodingKey);

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Latest);

            IJwtSigningDecodingKey signingDecodingKey = signingKey;
            IJwtEncryptingDecodingKey encryptingDecodingKey = encryptionEncodingKey;
            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;                    
                })
                .AddJwtBearer(jwtBearerOptions =>
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
                            if (await sessionService.IsSessionClosedAsync(context.Principal.FindFirst("UserId")?.Value, context.Principal.FindFirst("SessionId")?.Value)
                                || context.Principal.FindFirst("Ip")?.Value != context.HttpContext.Connection.RemoteIpAddress.ToString())
                            {
                                context.Fail("Invalid session");
                            }
                        }                        
                    };
                });                

            #endregion

            services.AddSignalR();

            var redisConfiguration = Configuration.GetSection("Redis").Get<RedisConfiguration>();            
            services.AddStackExchangeRedisExtensions<NewtonsoftSerializer>(redisConfiguration);

            //services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(""));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IHostApplicationLifetime applicationLifetime, IRedisCacheClient cache)
        {
            applicationLifetime.ApplicationStopping.Register(()=> {
                if (cache.Db0.Database.Multiplexer.IsConnected)
                {
                    Console.Write("Flushing Redis DBs and closing connections: ");                    
                    try
                    {
                        Console.Write('|');
                        IRedisDatabase currentDb;
                        for (int i = 0; i < 16; i++)
                        {
                            currentDb = cache.GetDb(i);                      
                            currentDb.FlushDbAsync();
                            // TODO: exception: sequence contains no elements
                            //currentDb.Database.Multiplexer.Dispose();
                            Console.Write('█');
                        }
                        Console.WriteLine("| - Completed");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("\nError: " + ex.Message);
                    }
                }                            
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                IdentityModelEventSource.ShowPII = true;
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseCors(builder => builder.WithOrigins("http://localhost:4200").AllowAnyMethod().AllowAnyHeader());

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseStaticFiles();
            app.UseAuthentication();                                            
            app.UseAuthorization();

            app.Use(async (context, next) =>
            {
                context.Response.Headers.Add("Content-Security-Policy",
                    $"default-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com https://ajax.googleapis.com" +
                    $" https://ajax.aspnetcdn.com https://stackpath.bootstrapcdn.com https://cdnjs.cloudflare.com https://code.jquery.com https://cdn.jsdelivr.net;" +
                    $" base-uri 'self'; report-uri /event/cspreport");
                context.Response.Headers.Add("x-xss-protection", "1; mode=block");
                context.Response.Headers.Add("X-Frame-Options", "DENY");
                context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
                await next();
            });            

            app.UseEndpoints(routes =>
            {
                routes.MapHub<MessageHub>("/messageHub");
            });

            app.UseEndpoints(endpoints =>
            {                
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }      
    }
}
