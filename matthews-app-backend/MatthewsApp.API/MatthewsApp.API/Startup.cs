
using IdentityModel.AspNetCore.OAuth2Introspection;
using MatthewsApp.API.Models;
using MatthewsApp.API.Mqtt;
using MatthewsApp.API.Repository;
using MatthewsApp.API.Repository.Interfaces;
using MatthewsApp.API.Services;
using MatthewsApp.API.Swagger.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Prism.Events;
using Serilog;
using System;
using System.Collections.Generic;

namespace MatthewsApp.API;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddLogging(loggingBuilder =>
          loggingBuilder.AddSerilog(dispose: true));

        services.AddControllers();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "MatthewsApp.API", Version = "v1" });
            c.AddSecurityDefinition("oauth2",
            new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.OAuth2,

                Flows = new OpenApiOAuthFlows
                {
                    AuthorizationCode = new OpenApiOAuthFlow
                    {
                        AuthorizationUrl = new Uri(Configuration["Swagger:Authority"] + "/connect/authorize", UriKind.Absolute),
                        TokenUrl = new Uri(Configuration["Swagger:Authority"] + "/connect/token", UriKind.Absolute),
                        Scopes = new Dictionary<string, string> { { "matthews.api", "matthews.api" } },
                    }
                },
            });
            c.OperationFilter<AuthorizeOperationFilter>();
        });

        var connectionString = Configuration["connectionStrings:MatthewsAppDBConnectionString"];

        services.AddDbContext<IMatthewsAppDBContext, MatthewsAppDBContext>(options => options.UseSqlServer(connectionString));

        services.AddSingleton<ICaseI4cHttpClientService, CaseI4cHttpClientService>();

        services.AddSignalR(o =>
        {
            o.EnableDetailedErrors = true;
        });
        services.AddSingleton<CaseHub>();

        services.AddSingleton<IEventAggregator>(new EventAggregator());
        services.AddHostedService<CaseMqttService>();
        services.AddScoped<ICasesService, CasesService>();
        services.AddScoped<ICaseRepository, CaseRepository>();
        services.AddScoped<IFacilityStatusService, FacilityStatusService>();
        services.AddScoped<IFacilityStatusRepository, FacilityStatusRepository>();

        services.Configure<FormOptions>(o =>
        {
            o.ValueLengthLimit = int.MaxValue;
            o.MultipartBodyLengthLimit = int.MaxValue;
            o.MemoryBufferThreshold = int.MaxValue;
        });

        services.AddAuthentication(OAuth2IntrospectionDefaults.AuthenticationScheme)
                .AddOAuth2Introspection(options =>
                {
                    options.Authority = Configuration["OAuth2Introspection:Authority"];
                    options.ClientId = "matthews.api";
                    options.ClientSecret = "62819d04e4ca43d993b7e9b769180e83";
                });

        services.Configure<ForwardedHeadersOptions>(options => { 
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(Configuration)
            //.WriteTo.File("C:\\mylogs\\log.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        app.UseForwardedHeaders();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "MatthewsApp.API v1");
                c.OAuthAppName("matthews.swagger");
                c.OAuthClientId("matthews.swagger");
                c.OAuthClientSecret("8f316032b4134fca974b44be7d3d816c");
                c.OAuthScopeSeparator(" ");
                c.OAuthUsePkce();
            });
        }

        var allowedOrigins = Configuration["AllowedOrigins"].Split(";");

        app.UseCors(x => x
        //.WithOrigins("http://localhost:4200", "https://develop.comdata.rs/MatthewsApp.API", "http://localhost:8100", "https://com.matthews.app")
        .WithOrigins(allowedOrigins)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());

        app.UseHttpsRedirection();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers().RequireAuthorization();
            endpoints.MapHub<CaseHub>("/casehub");
        });
    }

}
