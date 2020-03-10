using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface ISQLService
    {
        Task<List<T>> ExecuteStoredProcedureAsync<T>(string commandText, SqlParameter[] parameters, Func<SqlDataReader, Task<List<T>>> Handler);
    }
}
