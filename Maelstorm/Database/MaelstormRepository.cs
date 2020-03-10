using System;
using Maelstorm.Models;
using Microsoft.EntityFrameworkCore;

public abstract class MaelstormRepository : DbContext
{
    public DbSet<User> Users { get; protected set; }
    public DbSet<DialogMessage> DialogMessages { get; protected set; }
    public DbSet<Dialog> Dialogs { get; protected set; }
    public DbSet<Token> Tokens { get; protected set; }
    public DbSet<RegisteredApp> Apps { get; protected set; }
    public DbSet<Session> Sessions { get; protected set; }
    public DbSet<BannedDevice> BannedDevices { get; protected set; }
}