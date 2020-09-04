using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Models
{
    public class ServiceResult
    {
        public bool Ok { get { return ProblemDetails.Extensions.Count == 0 && ProblemDetails.Detail == null; } }
        public ProblemDetails ProblemDetails { get; set; }

        public ServiceResult()
        {
            ProblemDetails = new ProblemDetails();
        }
    }
}
