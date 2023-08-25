using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MatthewsApp.API.Migrations
{
    /// <inheritdoc />
    public partial class performedBy_change : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PerformedBy",
                table: "Cases",
                type: "nvarchar(64)",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "PerformedBy",
                table: "Cases",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(64)",
                oldNullable: true);
        }
    }
}
