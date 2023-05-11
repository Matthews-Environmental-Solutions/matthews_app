using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace MatthewsApp.API.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientId = table.Column<string>(type: "nvarchar(256)", nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(16)", nullable: false),
                    FacilityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(16)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(16)", nullable: false),
                    Weight = table.Column<double>(type: "float", nullable: false),
                    Gender = table.Column<int>(type: "int", nullable: false),
                    ContainerType = table.Column<int>(type: "int", nullable: false),
                    ContainerSize = table.Column<int>(type: "int", nullable: false),
                    IsObsolete = table.Column<bool>(type: "bit", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ScheduledFacility = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduledDevice = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduledDeviceAlias = table.Column<string>(type: "nvarchar(564)", nullable: true),
                    ScheduledStartTime = table.Column<DateTime>(type: "datetime2(7)", nullable: false),
                    ActualFacility = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActualDevice = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActualDeviceAlias = table.Column<string>(type: "nvarchar(564)", nullable: true),
                    ActualStartTime = table.Column<DateTime>(type: "datetime2(7)", nullable: false),
                    ActualEndTime = table.Column<DateTime>(type: "datetime2(7)", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedTime = table.Column<DateTime>(type: "datetime2(7)", nullable: false),
                    ModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModifiedTime = table.Column<DateTime>(type: "datetime2(7)", nullable: false),
                    PerformedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Fuel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Electricity = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cases", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cases");
        }
    }
}
