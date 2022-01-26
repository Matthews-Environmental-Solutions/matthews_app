using Microsoft.EntityFrameworkCore.Migrations;

namespace MatthewsApp.API.Migrations
{
    public partial class CaseModelUpdated : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FacilityId",
                table: "Cases",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FacilityId",
                table: "Cases");
        }
    }
}
