DECLARE @ApiResourceName VARCHAR(max), @CreationTime DateTime2, @ApiResourceId INT, @secretText varchar(max), @Hashbytes varbinary(128), @Secret VARCHAR(max);
SET @CreationTime = SYSUTCDATETIME();

-- This values could be modified by user
SET @ApiResourceName = N'matthews.api'; 
SET @secretText = '62819d04e4ca43d993b7e9b769180e83';

-- Creating a secret
SET @Hashbytes = hashbytes('sha2_256', @secretText);
SET @Secret = cast(N'' as xml).value('xs:base64Binary(sql:variable("@Hashbytes"))', 'varchar(128)');

IF NOT EXISTS 
(SELECT * FROM [dbo].[ApiResources] WHERE [Name] = @ApiResourceName)
	BEGIN
        
    INSERT [dbo].[ApiResources] ([Enabled], [Name], [DisplayName], [Description], [AllowedAccessTokenSigningAlgorithms], [ShowInDiscoveryDocument], [Created], [Updated], [LastAccessed], [NonEditable]) VALUES (1, @ApiResourceName, @ApiResourceName, NULL, NULL, 1, @CreationTime, NULL, NULL, 0)

    SET @ApiResourceId = (SELECT Id FROM  [dbo].[ApiResources] WHERE [Name] = @ApiResourceName)

    INSERT [dbo].[ApiResourceClaims] ([ApiResourceId], [Type]) VALUES (@ApiResourceId, N'permission')
    INSERT [dbo].[ApiResourceClaims] ([ApiResourceId], [Type]) VALUES (@ApiResourceId, N'role')
    INSERT [dbo].[ApiResourceClaims] ([ApiResourceId], [Type]) VALUES (@ApiResourceId, N'name')

    INSERT [dbo].[ApiResourceScopes] ([Scope], [ApiResourceId]) VALUES (@ApiResourceName, @ApiResourceId)  

    INSERT [dbo].[ApiResourceSecrets] ([Id], [ApiResourceId], [Description], [Value], [Expiration], [Type], [Created]) VALUES (@ApiResourceId, NULL, @Secret, NULL, N'SharedSecret', @CreationTime)

    INSERT [dbo].[ApiScopes] ([Enabled], [Name], [DisplayName], [Description], [Required], [Emphasize], [ShowInDiscoveryDocument]) VALUES ( 1, @ApiResourceName, @ApiResourceName, NULL, 0, 0, 1)
    END
ELSE 
	PRINT 'ApiResource '+ @ApiResourceName +' already exsists, please select an other name';