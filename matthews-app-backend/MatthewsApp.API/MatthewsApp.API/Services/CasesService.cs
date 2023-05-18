using MatthewsApp.API.Models;
using MatthewsApp.API.Repository;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services
{
    public interface ICasesService
    {
        void CreateCase(Case caseEntity);
        void DeleteCase(Case caseEntity);
        void UpdateCase(Case caseEntity);
        Task<IEnumerable<Case>> GetAllCases();
        Task<Case> GetCaseById(Guid id);
        bool IsCaseExists(Guid id);
        Task<IEnumerable<Case>> GetUnscheduledCases();
    }

    public class CasesService : ICasesService
    {
        private readonly IRepository<Case> repository;

        public CasesService(IRepository<Case> repository)
        {
            this.repository = repository;
        }

        public void CreateCase(Case caseEntity)
        {
            this.repository.Create(caseEntity);
        }

        public void DeleteCase(Case caseEntity)
        {
            this.repository.Delete(caseEntity);
        }

        public void UpdateCase(Case caseEntity)
        {
            this.repository.Update(caseEntity);
        }

        public async Task<IEnumerable<Case>> GetAllCases()
        {
            try
            {
                IEnumerable<Case> cases = await repository.GetAll();
                return cases.Select(i => {
                    i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime, DateTimeKind.Utc);
                    return i;
                });
            } catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            
        }

        public async Task<IEnumerable<Case>> GetUnscheduledCases()
        {
            return await repository.GetAllUnscheduled();
        }

        public async Task<Case> GetCaseById(Guid id)
        {
            return await this.repository.GetOne(id);
        }

        public bool IsCaseExists(Guid id)
        {
            return repository.GetAll().Result.Any(e => e.Id == id);
        }
    }
}
