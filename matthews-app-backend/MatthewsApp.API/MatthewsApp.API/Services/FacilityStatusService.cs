using MatthewsApp.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using MatthewsApp.API.Repository.Interfaces;
using System.Linq;

namespace MatthewsApp.API.Services
{
    public interface IFacilityStatusService
    {
        void Create(FacilityStatus entity);
        void Delete(FacilityStatus entity);
        void Update(FacilityStatus entity);
        Task<IEnumerable<FacilityStatus>> GetAll();
        Task<FacilityStatus> GetById(Guid id);
        Task<IEnumerable<FacilityStatus>> GetAllByFacility(Guid id);
        bool IsFacilityStatusExists(Guid id);
    }

    public class FacilityStatusService : IFacilityStatusService
    {
        private readonly IFacilityStatusRepository _repository;
        public FacilityStatusService(IFacilityStatusRepository repository)
        {
            _repository = repository;
        }

        public void Create(FacilityStatus entity)
        {
            _repository.Create(entity);
        }

        public void Delete(FacilityStatus entity)
        {
            _repository.Delete(entity.Id);
        }

        public async Task<IEnumerable<FacilityStatus>> GetAll()
        {
            return await _repository.GetAll();
        }

        public async Task<IEnumerable<FacilityStatus>> GetAllByFacility(Guid id)
        {
            return await _repository.GetAllByFacility(id);
        }

        public async Task<FacilityStatus> GetById(Guid id)
        {
            return await _repository.GetOne(id);
        }

        public void Update(FacilityStatus entity)
        {
            _repository.Update(entity);
        }

        public bool IsFacilityStatusExists(Guid id)
        {
            return _repository.GetAll().Result.Any(e => e.Id == id);
        }
    }
}
