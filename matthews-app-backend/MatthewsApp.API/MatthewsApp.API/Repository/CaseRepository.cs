using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository;

public class CaseRepository : BaseRepository<Case, Guid>, ICaseRepository
{
    private readonly IFacilityStatusRepository _facilityStatusRepository;

    public CaseRepository(IMatthewsAppDBContext context, IFacilityStatusRepository facilityStatusRepository) : base(context)
    {
        _facilityStatusRepository = facilityStatusRepository;
    }

    public Case GetTrackedEntity(Guid id)
    {
        return _dataContext.Cases.Local.FirstOrDefault(e => e.Id == id);
    }

    public void Detach(Case entity)
    {
        _dataContext.Context.Entry(entity).State = EntityState.Detached;
    }

    public Case GetById (Guid id)
    {
        return _dataContext.Cases.Include(c => c.FacilityStatus)
            .AsNoTracking()
            .FirstOrDefault(c => c.Id == id);
    }

    public async Task<Case> GetByIdAsync(Guid id)
    {
        return await _dataContext.Cases.Include(c => c.FacilityStatus)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);
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
        return await _dataContext.Cases.Include(c => c.FacilityStatus)
            //.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Case> GetNextCaseForDevice(Guid deviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();

        return cases.Where(c => 
                c.ScheduledDevice.Equals(deviceId)
                && c.FacilityStatus.Status == CaseStatus.READY_TO_CREMATE
                && c.IsObsolete == false
            )
            .OrderBy(c => c.ScheduledStartTime)
            .ToList()
            .First();
    }

    //ToDo: Ovo treba ukloniti.
    public override async Task<IEnumerable<Case>> GetAll()
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();
        return cases.Where(c => c.ScheduledStartTime > DateTime.MinValue.AddDays(100) &&c.IsObsolete == false);
    }

    public async Task<IEnumerable<Case>> GetAllUnscheduled()
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();

        return cases.Where(c => 
             (
                c.ScheduledStartTime < DateTime.MinValue.AddDays(100) 
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
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();
        return cases.Where(c => 
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.HasValue
            && c.ScheduledStartTime.Value >= date
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
    {
        DateTime dateEnd = dateStartDateOfWeek.AddDays(7);
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.HasValue
            && c.ScheduledStartTime.Value >= dateStartDateOfWeek
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetFirst20ScheduledCases(Guid scheduledDeviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledStartTime.HasValue
            && c.ScheduledStartTime > DateTime.MinValue.AddDays(100)
            && !c.ScheduledFacility.Equals(Guid.Empty)
            && c.ScheduledDevice.Equals(scheduledDeviceId)
            && (c.FacilityStatus.Status == CaseStatus.READY_TO_CREMATE)
            ).ToList().OrderBy(c => c.ScheduledStartTime).Take(20);
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.HasValue
            && c.ScheduledStartTime.Value >= dateStart
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledDevice.Equals(deviceId)
            && c.FacilityStatus.Status == CaseStatus.READY_TO_CREMATE
            ).ToList();
    }

    public async Task<Case> GetSelectCaseByDevice(Guid deviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();

        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledDevice.Equals(deviceId)
            && c.Selected)
            .ToList().FirstOrDefault();
    }

    public async Task<Case> GetInProgressCaseByDevice(Guid deviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.Include(c => c.FacilityStatus).ToArrayAsync();

        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledDevice.Equals(deviceId)
            && c.FacilityStatus.Status == CaseStatus.IN_PROGRESS)
            .ToList().FirstOrDefault();
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
        Guid DemoFacilityId = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494");

        Guid AwaitingPermissionStatus = _facilityStatusRepository.GetFirstAwaitingPermissionFacilityStatus(DemoFacilityId).Id; // Awaiting documents
        Guid CremationCompleteStatus = _facilityStatusRepository.GetCremationCompleteFacilityStatus(DemoFacilityId).Id; // Cremation complete
        Guid ReadyToCremateStatus = _facilityStatusRepository.GetReadyToCremateFacilityStatus(DemoFacilityId).Id; // Ready to cremate

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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.33),
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = ReadyToCremateStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.395833333),
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.458333333),
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.520833333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(0.583333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.333333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = ReadyToCremateStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.458333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = ReadyToCremateStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.520833333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(1.583333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(2.333333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = ReadyToCremateStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(2.395833333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = ReadyToCremateStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(2.458333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = ReadyToCremateStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(2.520833333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(3.333333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(3.395833333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(3.458333333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(3.520833333), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ScheduledStartTime = todayAtMidnight.AddDays(3.041666667), // Adjusted scheduled start time
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
        };
        Create(case18);

        //UNSCHEDULED
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
        };
        Create(case19);

        //UNSCHEDULED
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
        };
        Create(case20);

        //UNSCHEDULED
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
        };
        Create(case21);

        //UNSCHEDULED
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
        };
        Create(case22);

        //UNSCHEDULED
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
        };
        Create(case23);

        //UNSCHEDULED
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
        };
        Create(case24);

        //UNSCHEDULED
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
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = AwaitingPermissionStatus
        };
        Create(case25);

        var case26 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB - 203099",
            FirstName = "Abe",
            LastName = "Hodge",
            Weight = 390,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.BARIATRIC,
            Age = 64,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-0.666666667),
            ActualStartTime = todayAtMidnight.AddDays(-0.666666667),
            ActualEndTime = todayAtMidnight.AddDays(-0.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case26);

        var case27 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203098",
            FirstName = "Alejandra",
            LastName = "Hooper",
            Weight = 190,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 63,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-0.604166667),
            ActualStartTime = todayAtMidnight.AddDays(-0.604166667),
            ActualEndTime = todayAtMidnight.AddDays(-0.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case27);

        var case28 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203097",
            FirstName = "Amparo",
            LastName = "Powell",
            Weight = 125,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 91,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-1.666666667),
            ActualStartTime = todayAtMidnight.AddDays(-1.666666667),
            ActualEndTime = todayAtMidnight.AddDays(-1.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case28);

        var case29 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203096",
            FirstName = "Arnold",
            LastName = "Matthews",
            Weight = 180,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 67,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-1.604166667),
            ActualStartTime = todayAtMidnight.AddDays(-1.604166667),
            ActualEndTime = todayAtMidnight.AddDays(-1.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case29);

        var case30 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203095",
            FirstName = "Carly",
            LastName = "Mccann",
            Weight = 23,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.MDF_PARTICLE_BOARD,
            ContainerSize = ContainerSize.INFANT,
            Age = 5,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-1.541666667),
            ActualStartTime = todayAtMidnight.AddDays(-1.541666667),
            ActualEndTime = todayAtMidnight.AddDays(-1.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case30);

        var case31 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203094",
            FirstName = "Cecelia",
            LastName = "Martinez",
            Weight = 139,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 55,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-1.479166667),
            ActualStartTime = todayAtMidnight.AddDays(-1.479166667),
            ActualEndTime = todayAtMidnight.AddDays(-1.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case31);

        var case32 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203093",
            FirstName = "Celina",
            LastName = "Griffin",
            Weight = 116,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 67,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-2.666666667),
            ActualStartTime = todayAtMidnight.AddDays(-2.666666667),
            ActualEndTime = todayAtMidnight.AddDays(-2.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case32);

        var case33 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203092",
            FirstName = "Crystal",
            LastName = "Solomon",
            Weight = 125,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 65,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-2.604166667),
            ActualStartTime = todayAtMidnight.AddDays(-2.604166667),
            ActualEndTime = todayAtMidnight.AddDays(-2.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case33);

        var case34 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203091",
            FirstName = "Dusty",
            LastName = "Gill",
            Weight = 171,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 56,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-2.541666667),
            ActualStartTime = todayAtMidnight.AddDays(-2.541666667),
            ActualEndTime = todayAtMidnight.AddDays(-2.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case34);

        var case35 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203090",
            FirstName = "Eusebio",
            LastName = "Blair",
            Weight = 343,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.BARIATRIC,
            Age = 59,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-2.479166667),
            ActualStartTime = todayAtMidnight.AddDays(-2.479166667),
            ActualEndTime = todayAtMidnight.AddDays(-2.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case35);

        var case36 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203089",
            FirstName = "Hosea",
            LastName = "Mcclure",
            Weight = 188,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.BAG_SHROUD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 75,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-2.416666667),
            ActualStartTime = todayAtMidnight.AddDays(-2.416666667),
            ActualEndTime = todayAtMidnight.AddDays(-2.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case36);

        var case37 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203088",
            FirstName = "Jarvis",
            LastName = "Webster",
            Weight = 135,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 61,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-3.604166667),
            ActualStartTime = todayAtMidnight.AddDays(-3.604166667),
            ActualEndTime = todayAtMidnight.AddDays(-3.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case37);

        var case38 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203087",
            FirstName = "Jenny",
            LastName = "Mata",
            Weight = 101,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 81,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-3.541666667),
            ActualStartTime = todayAtMidnight.AddDays(-3.541666667),
            ActualEndTime = todayAtMidnight.AddDays(-3.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case38);

        var case39 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203086",
            FirstName = "Katherine",
            LastName = "Keller",
            Weight = 180,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 67,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-3.479166667),
            ActualStartTime = todayAtMidnight.AddDays(-3.479166667),
            ActualEndTime = todayAtMidnight.AddDays(-3.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case39);

        var case40 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203085",
            FirstName = "Latasha",
            LastName = "Woodard",
            Weight = 143,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.BAG_SHROUD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 54,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-3.416666667),
            ActualStartTime = todayAtMidnight.AddDays(-3.416666667),
            ActualEndTime = todayAtMidnight.AddDays(-3.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case40);

        var case41 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203084",
            FirstName = "Lidia",
            LastName = "Sloan",
            Weight = 132,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 86,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-3.354166667),
            ActualStartTime = todayAtMidnight.AddDays(-3.354166667),
            ActualEndTime = todayAtMidnight.AddDays(-3.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case41);

        var case42 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203083",
            FirstName = "Lynette",
            LastName = "Gardner",
            Weight = 141,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 86,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-4.666666667),
            ActualStartTime = todayAtMidnight.AddDays(-4.666666667),
            ActualEndTime = todayAtMidnight.AddDays(-4.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case42);

        var case43 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203082",
            FirstName = "Mae",
            LastName = "Woodward",
            Weight = 225,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 84,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-4.604166667),
            ActualStartTime = todayAtMidnight.AddDays(-4.604166667),
            ActualEndTime = todayAtMidnight.AddDays(-4.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case43);

        var case44 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203081",
            FirstName = "Markus",
            LastName = "Mccormick",
            Weight = 165,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.BAG_SHROUD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 83,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-4.541666667),
            ActualStartTime = todayAtMidnight.AddDays(-4.541666667),
            ActualEndTime = todayAtMidnight.AddDays(-4.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case44);

        var case45 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203080",
            FirstName = "Merlin",
            LastName = "Daniel",
            Weight = 195,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 83,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-4.479166667),
            ActualStartTime = todayAtMidnight.AddDays(-4.479166667),
            ActualEndTime = todayAtMidnight.AddDays(-4.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case45);

        var case46 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203079",
            FirstName = "Sharlene",
            LastName = "Russell",
            Weight = 90,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.BAG_SHROUD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 83,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-5.666666667),
            ActualStartTime = todayAtMidnight.AddDays(-5.666666667),
            ActualEndTime = todayAtMidnight.AddDays(-5.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case46);

        var case47 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203078",
            FirstName = "Sid",
            LastName = "Solis",
            Weight = 145,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 72,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-5.604166667),
            ActualStartTime = todayAtMidnight.AddDays(-5.604166667),
            ActualEndTime = todayAtMidnight.AddDays(-5.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case47);

        var case48 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203077",
            FirstName = "Tracy",
            LastName = "Payne",
            Weight = 223,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.CARDBOARD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 53,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-5.541666667),
            ActualStartTime = todayAtMidnight.AddDays(-5.541666667),
            ActualEndTime = todayAtMidnight.AddDays(-5.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case48);

        var case49 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203076",
            FirstName = "Trudy",
            LastName = "Farrell",
            Weight = 94,
            Gender = GenderType.FEMALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 92,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-5.479166667),
            ActualStartTime = todayAtMidnight.AddDays(-5.479166667),
            ActualEndTime = todayAtMidnight.AddDays(-5.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case49);

        var case50 = new Case
        {
            Id = Guid.NewGuid(),
            CreatedBy = Guid.Empty,
            CreatedTime = DateTime.Now,
            ClientId = "123",
            ClientCaseId = "SB-203075",
            FirstName = "Wade",
            LastName = "Hancock",
            Weight = 203,
            Gender = GenderType.MALE,
            ContainerType = ContainerType.HARDWOOD,
            ContainerSize = ContainerSize.STANDARD,
            Age = 85,
            ScheduledFacility = Guid.Parse("0c8f6429-5b54-486f-b0b1-9a9eb2fa0494"),
            ScheduledDevice = deviceId,
            ScheduledDeviceAlias = "Device DEMO",
            ActualDeviceAlias = "Device DEMO",
            PerformedBy = "Demo User",
            ScheduledStartTime = todayAtMidnight.AddDays(-5.416666667),
            ActualStartTime = todayAtMidnight.AddDays(-5.416666667),
            ActualEndTime = todayAtMidnight.AddDays(-5.375),
            Fuel = String.Empty,
            Electricity = String.Empty,
            FacilityStatusId = CremationCompleteStatus
        };
        Create(case50);

        return Task.CompletedTask;
    }

    public async Task<IEnumerable<Case>> GetSelectedCasesByDevice(Guid deviceId)
    {
        return await _dataContext.Cases
            .Where(c => c.ScheduledDevice == deviceId)
            .Include(c => c.FacilityStatus)
            .Where(c => c.Selected)
            .ToArrayAsync();
    }

    public async Task<bool> CheckIfDeviceHasCaseInProgress(Guid deviceId)
    {
         return await _dataContext.Cases
            .Where(c => c.ScheduledDevice == deviceId)
            .Include(c => c.FacilityStatus)
            .Where(c => c.FacilityStatus.Status == CaseStatus.IN_PROGRESS)
            .AnyAsync();
    }

    public Task<bool> CheckIfDeviceHasCaseSelected(Guid deviceId)
    {
        return _dataContext.Cases
            .Where(c => c.ScheduledDevice == deviceId)
            .Include(c => c.FacilityStatus)
            .Where(c => c.Selected)
            .AnyAsync();
    }

    public async Task<bool> CheckIfDeviceIsEmpty(Guid deviceId)
    {
        // detect if there are any cases in the device that are selected or in progress. Return true if there are no cases.
        return ! await _dataContext.Cases
            .Where(c => c.ScheduledDevice == deviceId)
            .Include(c => c.FacilityStatus)
            .Where(c => c.FacilityStatus.Status == CaseStatus.IN_PROGRESS || c.FacilityStatus.Status == CaseStatus.CYCLE_COMPLETE)
            .AnyAsync();
               
    }

    public async Task<IEnumerable<Case>> GetInProgressCasesByDevice(Guid deviceId)
    {
        return await _dataContext.Cases
            .Where(c => c.ScheduledDevice == deviceId)
            .Include(c => c.FacilityStatus)
            .Where(c => c.FacilityStatus.Status == CaseStatus.IN_PROGRESS)
            .ToArrayAsync();
    }

}
