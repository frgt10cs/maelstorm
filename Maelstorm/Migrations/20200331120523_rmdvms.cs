using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Maelstorm.Migrations
{
    public partial class rmdvms : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DialogViewModels");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DialogViewModels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    Image = table.Column<string>(type: "TEXT", nullable: true),
                    InterlocutorId = table.Column<int>(type: "INTEGER", nullable: false),
                    LastMessageDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastMessageNumber = table.Column<long>(type: "INTEGER", nullable: false),
                    LastMessageText = table.Column<string>(type: "TEXT", nullable: true),
                    Title = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                });
        }
    }
}
