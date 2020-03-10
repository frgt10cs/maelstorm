using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Maelstorm.Migrations
{
    public partial class sessionupd : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {            

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(nullable: false),
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
                    table.PrimaryKey("PK_Sessions", x => x.Id);
                });

            
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Apps");

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
