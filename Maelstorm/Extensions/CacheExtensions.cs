using System;
using Microsoft.Extensions.Caching.Distributed;
using System.Threading;
using System.Threading.Tasks;
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Linq;

public static class CacheExtensions
{
    public async static Task SetObjectAsync<T>(this IDistributedCache cache, string key, T value)
    {
        await cache.SetAsync(key, value.ToByteArray());
    }

    public async static Task<T> GetObjectAsync<T>(this IDistributedCache cache, string key) where T : class
    {
        return (await cache.GetAsync(key)).FromByteArray<T>();
    }

    public async static Task AddToListAsync<T>(this IDistributedCache cache, string key, T value)
    {
        var list = (await cache.GetAsync(key)).FromByteArray<List<T>>();
        if (list == null)
            list = new List<T>();
        list.Add(value);
        await cache.SetAsync(key, list.ToByteArray());
    }

    public async static Task<List<T>> GetListAsync<T>(this IDistributedCache cache, string key)
    {
        return (await cache.GetAsync(key)).FromByteArray<List<T>>();
    }

    public async static Task RemoveFromListAsync<T>(this IDistributedCache cache, string key, T value)
    {
        var list = (await cache.GetAsync(key)).FromByteArray<List<T>>();
        if (list != null)
        {
            list.Remove(value);
            await cache.SetAsync(key, list.ToByteArray());
        }
    }

    public async static Task RemoveFromListAsync<T>(this IDistributedCache cache, string key, Func<T, bool> predicate)
    {
        var list = (await cache.GetAsync(key)).FromByteArray<List<T>>();
        if (list != null)
        {
            var item = list.FirstOrDefault(predicate);
            if (item != null)
            {
                list.Remove(item);
                if (list.Any())
                {
                    await cache.SetAsync(key, list.ToByteArray());                    
                }
                else
                {
                    await cache.RemoveAsync(key);
                }
            }
        }
    }
}

public static class Serialization
{
    public static byte[] ToByteArray(this object obj)
    {
        if (obj == null)
        {
            return null;
        }
        BinaryFormatter binaryFormatter = new BinaryFormatter();
        using (MemoryStream memoryStream = new MemoryStream())
        {
            binaryFormatter.Serialize(memoryStream, obj);
            return memoryStream.ToArray();
        }
    }
    public static T FromByteArray<T>(this byte[] byteArray) where T : class
    {
        if (byteArray == null)
        {
            return default(T);
        }
        BinaryFormatter binaryFormatter = new BinaryFormatter();
        using (MemoryStream memoryStream = new MemoryStream(byteArray))
        {
            return binaryFormatter.Deserialize(memoryStream) as T;
        }
    }
}