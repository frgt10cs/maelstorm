using Microsoft.EntityFrameworkCore.Migrations;

namespace Maelstorm.Migrations
{
    public partial class cryptoDialog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EncryptedFirstPrivateKey",
                table: "Dialogs",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EncryptedSecondPrivateKey",
                table: "Dialogs",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicKey",
                table: "Dialogs",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EncryptedFirstPrivateKey",
                table: "Dialogs");

            migrationBuilder.DropColumn(
                name: "EncryptedSecondPrivateKey",
                table: "Dialogs");

            migrationBuilder.DropColumn(
                name: "PublicKey",
                table: "Dialogs");
        }
    }
}
