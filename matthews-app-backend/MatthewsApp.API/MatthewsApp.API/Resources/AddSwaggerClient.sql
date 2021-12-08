DECLARE @ClientName VARCHAR(max), @ClientDescription VARCHAR(max), @ClientId INT, @secretText varchar(max), @Hashbytes varbinary(128), @Secret VARCHAR(max), @CreationTime DateTime2, @RedirectUri varchar(max), @ApiName varchar(max);
SET @CreationTime = SYSUTCDATETIME();

-- This values could be modified by user
SET @ClientName = N'matthews.swagger'; 
SET @ClientDescription = N'matthews.swagger Client';
SET @secretText = '8f316032b4134fca974b44be7d3d816c';
SET @RedirectUri = N'https://localhost:44320/swagger/oauth2-redirect.html';
SET @ApiName = N'matthews.api'; 

-- Creating a secret
SET @Hashbytes = hashbytes('sha2_256', @secretText);
SET @Secret = cast(N'' as xml).value('xs:base64Binary(sql:variable("@Hashbytes"))', 'varchar(128)');

IF NOT EXISTS 
(SELECT * FROM [dbo].[Clients] WHERE ClientId = @ClientName)
	BEGIN

      PRINT 'Creating a client with clientId:' + @ClientName;
      INSERT [dbo].[Clients] ([Enabled], [ClientId], [ProtocolType], [RequireClientSecret], [ClientName], [Description], [ClientUri], [LogoUri], [RequireConsent], [AllowRememberConsent],
      [AlwaysIncludeUserClaimsInIdToken], [RequirePkce], [AllowPlainTextPkce], [RequireRequestObject], [AllowAccessTokensViaBrowser], [FrontChannelLogoutUri], [FrontChannelLogoutSessionRequired], 
      [BackChannelLogoutUri], [BackChannelLogoutSessionRequired], [AllowOfflineAccess], [IdentityTokenLifetime], [AllowedIdentityTokenSigningAlgorithms], [AccessTokenLifetime], [AuthorizationCodeLifetime],
      [ConsentLifetime], [AbsoluteRefreshTokenLifetime], [SlidingRefreshTokenLifetime], [RefreshTokenUsage], [UpdateAccessTokenClaimsOnRefresh], [RefreshTokenExpiration], [AccessTokenType],
         [EnableLocalLogin], [IncludeJwtId], [AlwaysSendClientClaims], [ClientClaimsPrefix], [PairWiseSubjectSalt], [Created], [Updated], [LastAccessed], [UserSsoLifetime], [UserCodeType], [DeviceCodeLifetime], [NonEditable]) 
         VALUES (1, @ClientName, N'oidc', 1, @ClientDescription, NULL, NULL, NULL, 0, 1, 0, 0, 0, 0, 0, NULL, 1, NULL, 1, 1, 300, NULL, 3600, 300, NULL, 2592000, 1296000, 1, 0, 1, 1, 1, 1, 0, N'client_', NULL, @CreationTime, NULL, NULL, NULL, NULL, 300, 0)

      SET @ClientId = (SELECT Id FROM  [dbo].[Clients] WHERE ClientId = @ClientName)

      PRINT 'Creating a ClientGrantTypes, password';
      INSERT [dbo].[ClientGrantTypes] ([GrantType], [ClientId]) VALUES (N'authorization_code', @ClientId)

      PRINT 'Creating ClientScope profile';
      INSERT [dbo].[ClientScopes] ([Scope], [ClientId]) VALUES (N'profile', @ClientId)
      PRINT 'Creating ClientScope openid';
      INSERT [dbo].[ClientScopes] ([Scope], [ClientId]) VALUES (N'openid', @ClientId)
      PRINT 'Creating ClientScope email';
      INSERT [dbo].[ClientScopes] ([Scope], [ClientId]) VALUES (N'email', @ClientId)
      PRINT 'Creating ClientScope for new api';
      INSERT [dbo].[ClientScopes] ([Scope], [ClientId]) VALUES (@ApiName, @ClientId)      

      PRINT 'Creating ClientSecret: ' + @secretText;
      INSERT [dbo].[ClientSecrets] ([ClientId], [Description], [Value], [Expiration], [Type], [Created]) VALUES (@ClientId, NULL, @Secret, NULL, N'SharedSecret', @CreationTime)
	
      PRINT 'Creating ClientRedirectUri: ' + @RedirectUri;
      INSERT [dbo].[ClientRedirectUris] ([RedirectUri], [ClientId]) VALUES (@RedirectUri, @ClientId)
    END
ELSE 
	PRINT 'Client '+ @ClientName +' already exsists, please select an other name';
