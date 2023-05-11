using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository
{
    public interface IRepository<T>
    {
        Task<IEnumerable<T>> GetAll();
        void Create(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task<T> GetOne(Guid id);

    }
}


