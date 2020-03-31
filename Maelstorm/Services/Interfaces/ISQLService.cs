using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface ISQLService
    {
        Task<List<T>> ExecuteAsync<T>(string commandText, DbParameter[] parameters, Func<DbDataReader, Task<List<T>>> Convertor, CommandType commandType = CommandType.Text);
    }
}
