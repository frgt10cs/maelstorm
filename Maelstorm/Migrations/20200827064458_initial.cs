using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Maelstorm.Migrations
{
    public partial class initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BannedDevices",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(nullable: false),
                    Fingerprint = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BannedDevices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DialogMessages",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AuthorId = table.Column<long>(nullable: false),
                    TargetId = table.Column<long>(nullable: false),
                    DialogId = table.Column<long>(nullable: false),
                    DateOfSending = table.Column<DateTime>(nullable: false),
                    IsReaded = table.Column<bool>(nullable: false),
                    IsVisibleForAuthor = table.Column<bool>(nullable: false),
                    IsVisibleForOther = table.Column<bool>(nullable: false),
                    Text = table.Column<string>(nullable: true),
                    IVBase64 = table.Column<string>(nullable: true),
                    ReplyId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DialogMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Dialogs",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstUserId = table.Column<int>(nullable: false),
                    SecondUserId = table.Column<int>(nullable: false),
                    IsClosed = table.Column<bool>(nullable: false),
                    SaltBase64 = table.Column<string>(nullable: true),
                    EncryptedFirstCryptoKey = table.Column<string>(nullable: true),
                    EncryptedSecondCryptoKey = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dialogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    SessionId = table.Column<string>(nullable: false),
                    UserId = table.Column<long>(nullable: false),
                    RefreshToken = table.Column<string>(nullable: true),
                    OsCpu = table.Column<string>(nullable: true),
                    App = table.Column<string>(nullable: true),
                    IpAddress = table.Column<string>(nullable: true),
                    Location = table.Column<string>(nullable: true),
                    FingerPrint = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.SessionId);
                });

            migrationBuilder.CreateTable(
                name: "Tokens",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(nullable: false),
                    Value = table.Column<string>(nullable: true),
                    Action = table.Column<byte>(nullable: false),
                    GenerationDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DateOfRegistration = table.Column<DateTime>(nullable: false),
                    Email = table.Column<string>(nullable: true),
                    Nickname = table.Column<string>(nullable: true),
                    Image = table.Column<string>(nullable: true),
                    PasswordSalt = table.Column<string>(nullable: true),
                    KeySalt = table.Column<string>(nullable: true),
                    PasswordHash = table.Column<string>(nullable: true),
                    Role = table.Column<byte>(nullable: false),
                    Status = table.Column<string>(nullable: true),
                    EmailIsConfirmed = table.Column<bool>(nullable: false),
                    PublicKey = table.Column<string>(nullable: true),
                    EncryptedPrivateKey = table.Column<string>(nullable: true),
                    IVBase64 = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BannedDevices");

            migrationBuilder.DropTable(
                name: "DialogMessages");

            migrationBuilder.DropTable(
                name: "Dialogs");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropTable(
                name: "Tokens");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
