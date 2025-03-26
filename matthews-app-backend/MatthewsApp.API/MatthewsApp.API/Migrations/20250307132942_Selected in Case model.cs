using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MatthewsApp.API.Migrations
{
    /// <inheritdoc />
    public partial class SelectedinCasemodel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Selected",
                table: "Cases",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Selected",
                table: "Cases");
        }
    }
}
