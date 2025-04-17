using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MatthewsApp.API.Migrations
{
    /// <inheritdoc />
    public partial class removecontainersize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContainerSize",
                table: "Cases");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ContainerSize",
                table: "Cases",
                type: "int",
                nullable: true);
        }
    }
}
