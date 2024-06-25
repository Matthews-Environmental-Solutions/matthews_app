using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MatthewsApp.API.Migrations
{
    /// <inheritdoc />
    public partial class CasehasnewfieldPhysicalId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhysicalId",
                table: "Cases",
                type: "nvarchar(256)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhysicalId",
                table: "Cases");
        }
    }
}
