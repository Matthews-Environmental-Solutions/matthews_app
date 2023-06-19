using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository;

public abstract class BaseRepository<T, TKey> : IBaseRepository<T, TKey> where T : class
{
    protected IMatthewsAppDBContext _dataContext;

    protected BaseRepository(IMatthewsAppDBContext dataContext)
    {
        _dataContext = dataContext;
    }

    public virtual T Create(T entity)
    {
        EntityEntry<T>? returnEntity = null;
        if (entity is IBaseEntity baseEntity)
        {
            baseEntity.CreatedTime = DateTime.Now;
        }

        var transaction = _dataContext.Context.Database.BeginTransaction();
        try
        {
            returnEntity = _dataContext.Context.Set<T>().Add(entity);
            _dataContext.Context.SaveChanges();
            transaction.Commit();
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }

        return returnEntity.Entity;
    }

    public virtual void Delete(TKey id)
    {
        var context = _dataContext.Context;
        var transaction = context.Database.BeginTransaction();
        try
        {
            var entity = context.Set<T>().Find((id));
            if (entity is null)
            {
                throw new Exception("Entity not found for deletion");
            }
            DeleteEntry(entity);
            transaction.Commit();
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }

    public virtual async Task<IEnumerable<T>> GetAll()
    {
        return _dataContext.Context.Set<T>().ToList();
    }

    public virtual async Task<T> GetOne(TKey id)
    {
        return await _dataContext.Context.Set<T>().FindAsync(id);
    }

    public virtual void Update(T entity)
    {
        DbContext? context = _dataContext.Context;
        if (entity is IBaseEntity baseEntity)
        {
            baseEntity.ModifiedTime = DateTime.Now;
        }
        var transaction = context.Database.BeginTransaction();
        try
        {
            context.Set<T>().Attach(entity);
            context.Entry(entity).State = EntityState.Modified;
            context.SaveChanges();
            transaction.Commit();
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }

    protected virtual void DeleteEntry(T entity)
    {
        _dataContext.Context.Set<T>().Attach(entity);
        _dataContext.Context.Entry(entity).State = EntityState.Deleted;
        _dataContext.Context.SaveChanges();
    }
}
