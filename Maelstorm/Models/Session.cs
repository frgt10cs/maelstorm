using System;

public class Session
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string SessionId { get; set; }
    public string RefreshToken { get; set; }
    public string OsCpu { get; set; }
    public string App { get; set; }
    public string IpAddress { get; set; }
    public string Location { get; set; }
    public string FingerPrint { get; set; }
    public DateTime CreatedAt { get; set; }
    // public int ExpiresInDays { get; set; }
}