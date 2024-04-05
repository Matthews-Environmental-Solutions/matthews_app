using Humanizer;
using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Extensions;
using MatthewsApp.API.Mappers;
using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository;

public class CaseRepository : BaseRepository<Case, Guid>, ICaseRepository
{

    public CaseRepository(IMatthewsAppDBContext context) : base(context) 
    {
    }

    public Case GetById (Guid id)
    {
        return _dataContext.Cases
            .AsNoTracking()
            .FirstOrDefault(c => c.Id == id);
    }

    public override void Delete(Guid id)
    {
        var entity = _dataContext.Context.Set<Case>().Find((id));
        if (entity is null)
        {
            throw new Exception("Entity not found for deletion");
        }
        entity.IsObsolete = true;
        entity.ModifiedTime = DateTime.Now;
        _dataContext.Context.Entry(entity).State = EntityState.Modified;
        _dataContext.Context.SaveChanges();
    }

    public override async Task<Case> GetOne(Guid id)
    {
        return await _dataContext.Cases
            //.AsNoTracking()
            .FirstAsync(c => c.Id == id);
    }

    public async Task<Case> GetNextCaseForDevice(Guid deviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => 
                c.ScheduledDevice.Equals(deviceId)
                && c.Status == CaseStatus.READY_TO_CREMATE
                && c.IsObsolete == false
            )
            .OrderBy(c => c.ScheduledStartTime)
            .ToList()
            .First();
    }

    //ToDo: Ovo treba ukloniti.
    public override async Task<IEnumerable<Case>> GetAll()
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => c.ScheduledStartTime > DateTime.MinValue.AddDays(100) &&c.IsObsolete == false);
    }

    public async Task<IEnumerable<Case>> GetAllUnscheduled()
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();

        return cases.Where(c => 
             (
                c.ScheduledStartTime < DateTime.MinValue.AddDays(100) 
                || c.Status == CaseStatus.UNSCHEDULED
                || c.ScheduledFacility == Guid.Empty
                || c.ScheduledDevice == Guid.Empty
             )

            && c.IsObsolete == false
            )
            .ToList();
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
    {
        DateTime dateEnd = date.AddDays(1);
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => 
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.Value >= date
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
    {
        DateTime dateEnd = dateStartDateOfWeek.AddDays(7);
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.Value >= dateStartDateOfWeek
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetFirst20ScheduledCases(Guid scheduledDeviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledStartTime > DateTime.MinValue.AddDays(100)
            && !c.ScheduledFacility.Equals(Guid.Empty)
            && c.ScheduledDevice.Equals(scheduledDeviceId)
            && c.Status == CaseStatus.READY_TO_CREMATE
            ).ToList().OrderBy(c => c.ScheduledStartTime).Take(20);
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.Value >= dateStart
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }


    public async Task<IEnumerable<Case>> GetCasesByFacility(Guid facilityId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && (c.Status == CaseStatus.WAITING_FOR_PERMIT || c.Status == CaseStatus.UNSCHEDULED || c.Status == CaseStatus.READY_TO_CREMATE)
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledDevice.Equals(deviceId)
            && c.Status == CaseStatus.READY_TO_CREMATE
            ).ToList();
    }

    public Task CleanDbForDemo(Guid deviceId)
    {
        try
        {
            var casesToDelete = _dataContext.Cases.Where(c => c.ScheduledDevice == deviceId).ToArray();
            foreach (var c in casesToDelete)
            {
                DeleteEntry(c);
            }
            return Task.CompletedTask;
        }
        catch (Exception)
        {
            throw;
        }
    }

    public Task SeedDbForDemo(Guid deviceId)
    {
        DateTime todayAtMidnight = DateTime.Now.Date;

        var case1 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,

            ClientId = "123",
            ClientCaseId = "SB-203101",
            FirstName = "Rebeca",
            LastName = "Machado",
            Weight = 390,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.BARIATRIC,
            Age = 64,
            Status = CaseStatus.READY_TO_CREMATE,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(-0.666666667),
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ada13916-8972-4eff-b2a7-b1d6b48c9191") // Ready to cremate
        };
        Create(case1);

        var case2 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,

            ClientId = "123",
            ClientCaseId = "SB-203102",
            FirstName = "Matias",
            LastName = "Reyna",
            Weight = 190,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 63,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(-0.625),
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case2);

        var case3 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,

            ClientId = "123",
            ClientCaseId = "SB-203103",
            FirstName = "Leonarda",
            LastName = "Zamarripa",
            Weight = 125,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 91,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(-0.583333333),
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ada13916-8972-4eff-b2a7-b1d6b48c9191") // Ready to cremate
        };
        Create(case3);

        // creating cases

        var case4 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203104",
            FirstName = "Yuri",
            LastName = "Quiñonez",
            Weight = 180,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 67,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(-0.541666667), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case4);

        var case5 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203105",
            FirstName = "Fabian",
            LastName = "Barron",
            Weight = 23,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.MDF_PARTICLE_BOARD,
            ContainerSize = ContainerSize.INFANT,
            Age = 5,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.25), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case5);

        var case6 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203106",
            FirstName = "Sílvia",
            LastName = "Briseño",
            Weight = 139,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 55,
            Status = CaseStatus.READY_TO_CREMATE,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.333333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ada13916-8972-4eff-b2a7-b1d6b48c9191") // Ready to cremate
        };
        Create(case6);

        var case7 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203107",
            FirstName = "Valeria",
            LastName = "Pimentel",
            Weight = 116,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 67,
            Status = CaseStatus.READY_TO_CREMATE,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.416666667), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ada13916-8972-4eff-b2a7-b1d6b48c9191") // Ready to cremate
        };
        Create(case7);

        var case8 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203108",
            FirstName = "Honorio",
            LastName = "Ramon",
            Weight = 125,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 65,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.5), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case8);

        var case9 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203109",
            FirstName = "Karla",
            LastName = "Tovar",
            Weight = 171,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 56,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.25), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case9);

        var case10 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203110",
            FirstName = "Yeni",
            LastName = "Otero",
            Weight = 343,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.BARIATRIC,
            Age = 59,
            Status = CaseStatus.READY_TO_CREMATE,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.291666667), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ada13916-8972-4eff-b2a7-b1d6b48c9191") // Ready to cremate
        };
        Create(case10);

        var case11 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203111",
            FirstName = "Obdulia",
            LastName = "Llamas",
            Weight = 188,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.BAG_SHROUD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 75,
            Status = CaseStatus.READY_TO_CREMATE,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.333333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ada13916-8972-4eff-b2a7-b1d6b48c9191") // Ready to cremate
        };
        Create(case11);

        var case12 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203112",
            FirstName = "Sabina",
            LastName = "Mosqueda",
            Weight = 135,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 61,
            Status = CaseStatus.READY_TO_CREMATE,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.375), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ada13916-8972-4eff-b2a7-b1d6b48c9191") // Ready to cremate
        };
        Create(case12);

        var case13 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203113",
            FirstName = "Marcos",
            LastName = "Moncada",
            Weight = 101,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 81,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.416666667), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case13);

        var case14 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203114",
            FirstName = "Yessica",
            LastName = "Sierra",
            Weight = 180,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 67,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(2.25), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case14);

        var case15 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203115",
            FirstName = "António",
            LastName = "Urbano",
            Weight = 143,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.BAG_SHROUD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 54,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(2.416666667), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("f92460ab-4947-441f-9adf-5c81667fc982") // Medical device removal needed
        };
        Create(case15);

        var case16 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203116",
            FirstName = "Walter",
            LastName = "Caro",
            Weight = 132,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 86,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(2.583333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("f92460ab-4947-441f-9adf-5c81667fc982") // Medical device removal needed
        };
        Create(case16);

        var case17 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203117",
            FirstName = "Adalberto",
            LastName = "Calzada",
            Weight = 141,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 86,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(3.5), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case17);

        var case18 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203118",
            FirstName = "Reymundo",
            LastName = "de",
            Weight = 225,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 84,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(3.041666667), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case18);

        var case19 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203119",
            FirstName = "Edith",
            LastName = "Benitez",
            Weight = 165,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.BAG_SHROUD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 83,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case19);

        var case20 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203120",
            FirstName = "Catalina",
            LastName = "de",
            Weight = 195,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 83,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ef74e5a8-06a3-4690-b4c8-dc692421c082") // New cremation case
        };
        Create(case20);

        var case21 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203121",
            FirstName = "Emmanuel",
            LastName = "Ceja",
            Weight = 90,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.BAG_SHROUD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 83,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case21);

        var case22 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203122",
            FirstName = "Samuel",
            LastName = "Mercado",
            Weight = 145,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 72,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case22);

        var case23 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203123",
            FirstName = "Adela",
            LastName = "Guadalupe",
            Weight = 223,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 53,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("a9366ef0-acf8-44a3-b955-b66a3266b090") // Awaiting documents
        };
        Create(case23);

        var case24 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203124",
            FirstName = "Doris",
            LastName = "Jaime",
            Weight = 94,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 92,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ef74e5a8-06a3-4690-b4c8-dc692421c082") // New cremation case
        };
        Create(case24);

        var case25 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203125",
            FirstName = "Loreto",
            LastName = "Cantu",
            Weight = 203,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 85,
            Status = CaseStatus.WAITING_FOR_PERMIT,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = Guid.Parse("ef74e5a8-06a3-4690-b4c8-dc692421c082") // New cremation case
        };
        Create(case25);


        return Task.CompletedTask;
    }
}
