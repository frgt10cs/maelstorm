using System;
using System.Security.Claims;
using System.Collections.Generic;

public class JwtValidationResult
{
    public bool IsSuccessful { get; private set; }
    public ClaimsPrincipal Principial { get; private set; }
    public bool IsTokenExpired { get; set; }
    public Exception ValidationException { get; private set; }

    public void SetSuccess(ClaimsPrincipal principial)
    {
        IsSuccessful = true;
        Principial = principial;
    }
    public void SetFail(Exception exception)
    {
        IsSuccessful = false;
        ValidationException = exception;
    }
}