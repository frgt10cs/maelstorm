using Microsoft.EntityFrameworkCore.Migrations;

namespace Maelstorm.Migrations
{
    public partial class sessionID : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SessionId",
                table: "Sessions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "Sessions");
        }
    }
}
