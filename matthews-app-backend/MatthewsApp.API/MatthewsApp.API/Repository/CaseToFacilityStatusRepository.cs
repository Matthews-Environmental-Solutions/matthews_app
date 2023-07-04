using IdentityModel;
using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository;

public class CaseToFacilityStatusRepository : ICaseToFacilityStatusRepository
{
    protected IMatthewsAppDBContext _dataContext;

    public CaseToFacilityStatusRepository(IMatthewsAppDBContext context)
    {
        _dataContext = context;
    }

    public CaseToFacilityStatus Add(CaseToFacilityStatus entity)
    {
        EntityEntry<CaseToFacilityStatus>? returnEntity = null;
        entity.CreatedTime = DateTime.Now;
        
        var transaction = _dataContext.Context.Database.BeginTransaction();
        try
        {
            returnEntity = _dataContext.Context.Set<CaseToFacilityStatus>().Add(entity);
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

    public void Delete(CaseToFacilityStatus status)
    {
        var context = _dataContext.Context;
        var transaction = context.Database.BeginTransaction();
        try
        {
            var entity = context.Set<CaseToFacilityStatus>().Find(status.FacilityStatusId, status.Case);
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

    public void Update(CaseToFacilityStatus entity)
    {
        DbContext? context = _dataContext.Context;
        entity.ModifiedTime = DateTime.Now;
        
        var transaction = context.Database.BeginTransaction();
        try
        {
            context.Set<CaseToFacilityStatus>().Attach(entity);
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

    protected virtual void DeleteEntry(CaseToFacilityStatus entity)
    {
        _dataContext.Context.Set<CaseToFacilityStatus>().Attach(entity);
        _dataContext.Context.Entry(entity).State = EntityState.Deleted;
        _dataContext.Context.SaveChanges();
    }
}
