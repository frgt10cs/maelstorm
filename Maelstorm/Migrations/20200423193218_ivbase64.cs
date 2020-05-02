using Microsoft.EntityFrameworkCore.Migrations;

namespace Maelstorm.Migrations
{
    public partial class ivbase64 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IVBase64",
                table: "DialogMessages",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IVBase64",
                table: "DialogMessages");
        }
    }
}
