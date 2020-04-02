using Maelstorm.Database;
using Maelstorm.Services.Interfaces;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class SQLService : ISQLService
    {
        private MaelstormContext context;        
        public SQLService(MaelstormContext context)
        {
            this.context = context;            
        }

        public async Task<List<T>> ExecuteAsync<T>(string commandText, DbParameter[] parameters, Func<DbDataReader, Task<List<T>>> Convertor, CommandType commandType)
        {
            List<T> models;
            string connectionString = context.Database.GetDbConnection().ConnectionString;               
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                using (SqlCommand command = connection.CreateCommand())
                {                                        
                    command.CommandType = commandType;
                    command.CommandText = commandText;
                    foreach(var parameter in parameters)
                    {
                        command.Parameters.Add(parameter);
                    }
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        models = await Convertor(reader);
                        reader.Close();
                    }
                }
            }
            return models;
        }        
    }
}