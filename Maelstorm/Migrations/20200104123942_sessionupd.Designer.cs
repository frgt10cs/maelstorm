﻿// <auto-generated />
using System;
using Maelstorm.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Maelstorm.Migrations
{
    [DbContext(typeof(MaelstormContext))]
    [Migration("20200104123942_sessionupd")]
    partial class sessionupd
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.6-servicing-10079");

            modelBuilder.Entity("Maelstorm.Models.Dialog", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("FirstUserId");

                    b.Property<bool>("IsClosed");

                    b.Property<DateTime>("LastActive");

                    b.Property<int>("SecondUserId");

                    b.HasKey("Id");

                    b.ToTable("Dialogs");
                });

            modelBuilder.Entity("Maelstorm.Models.DialogMessage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AuthorId");

                    b.Property<DateTime>("DateOfSending");

                    b.Property<int>("DialogId");

                    b.Property<bool>("IsVisibleForAuthor");

                    b.Property<bool>("IsVisibleForOther");

                    b.Property<int>("ReplyId");

                    b.Property<byte>("Status");

                    b.Property<int>("TargetId");

                    b.Property<string>("Text");

                    b.HasKey("Id");

                    b.ToTable("DialogMessages");
                });

            modelBuilder.Entity("Maelstorm.Models.RegisteredApp", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<bool>("IsActive");

                    b.Property<string>("SecretKey");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.ToTable("Apps");
                });

            modelBuilder.Entity("Maelstorm.Models.Token", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<byte>("Action");

                    b.Property<DateTime>("GenerationDate");

                    b.Property<int>("UserId");

                    b.Property<string>("Value");

                    b.HasKey("Id");

                    b.ToTable("Tokens");
                });

            modelBuilder.Entity("Maelstorm.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("DateOfRegistration");

                    b.Property<string>("Email");

                    b.Property<bool>("EmailIsConfirmed");

                    b.Property<string>("Image");

                    b.Property<string>("Nickname");

                    b.Property<string>("PasswordHash");

                    b.Property<byte>("Role");

                    b.Property<string>("Salt");

                    b.Property<string>("Status");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Session", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("App");

                    b.Property<DateTime>("CreatedAt");

                    b.Property<string>("FingerPrint");

                    b.Property<string>("IpAddress");

                    b.Property<string>("Location");

                    b.Property<string>("OsCpu");

                    b.Property<string>("RefreshToken");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.ToTable("Sessions");
                });
#pragma warning restore 612, 618
        }
    }
}
