using Maelstorm.Database;
using Maelstorm.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
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

        public async Task<List<T>> ExecuteStoredProcedureAsync<T>(string commandText, SqlParameter[] parameters, Func<SqlDataReader, Task<List<T>>> Convertor)
        {
            List<T> models;
            string connectionString = context.Database.GetDbConnection().ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                using (SqlCommand command = connection.CreateCommand())
                {                    
                    command.CommandType = CommandType.StoredProcedure;
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