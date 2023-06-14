using MatthewsApp.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository.Interfaces
{
    public interface IBaseRepository<TEntity, TKey> where TEntity : class
    {
        Task<IEnumerable<TEntity>> GetAll();
        TEntity Create(TEntity entity);
        void Update(TEntity entity);
        void Delete(TKey id);
        Task<TEntity> GetOne(TKey id);

    }
}


