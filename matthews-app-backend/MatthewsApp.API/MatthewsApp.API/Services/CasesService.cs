using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services
{
    public interface ICasesService
    {
        void Create(Case caseEntity);
        void Delete(Case caseEntity);
        void Update(Case caseEntity);
        Task<IEnumerable<Case>> GetAll();
        Task<Case> GetById(Guid id);
        bool IsCaseExists(Guid id);
        Task<IEnumerable<Case>> GetUnscheduledCases();
        Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
        Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
    }

    public class CasesService : ICasesService
    {
        private readonly ICaseRepository _repository;

        public CasesService(ICaseRepository repository)
        {
            _repository = repository;
        }

        public void Create(Case entity)
        {
            _repository.Create(entity);
        }

        public void Delete(Case entity)
        {
            _repository.Delete(entity.Id);
        }

        public void Update(Case entity)
        {
            _repository.Update(entity);
        }

        public async Task<IEnumerable<Case>> GetAll()
        {
            try
            {
                IEnumerable<Case> cases = await _repository.GetAll();
                return cases.Select(i => {
                    i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime.Value, DateTimeKind.Utc);
                    return i;
                });
            } catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            
        }

        public async Task<IEnumerable<Case>> GetUnscheduledCases()
        {
            return await _repository.GetAllUnscheduled();
        }

        public async Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
        {
            try
            {
                IEnumerable<Case> cases = await _repository.GetScheduledCasesByDay(facilityId, date);
                return cases.Select(i => {
                    i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime.Value, DateTimeKind.Utc);
                    return i;
                });
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
        {
            try
            {
                IEnumerable<Case> cases = await _repository.GetScheduledCasesByWeek(facilityId, dateStartDateOfWeek);
                return cases.Select(i => {
                    i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime.Value, DateTimeKind.Utc);
                    return i;
                });
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<Case> GetById(Guid id)
        {
            return await _repository.GetOne(id);
        }

        public bool IsCaseExists(Guid id)
        {
            return _repository.GetAll().Result.Any(e => e.Id == id);
        }
                
    }
}
