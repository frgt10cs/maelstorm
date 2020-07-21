﻿using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Models
{
    /// <summary>
    /// Store result of excecuting code. Success by default
    /// </summary>
    public class ServiceResult
    {
        public bool IsSuccessful { get; set; }
        public List<string> ErrorMessages { get; set; } = new List<string>();
        public string Data { get; set; }

        public ServiceResult()
        {
            IsSuccessful = true;
        }

        public ServiceResult(bool result)
        {
            IsSuccessful = result;
        }

        public ServiceResult(ModelStateDictionary modelState)
        {
            if (modelState.IsValid)
            {
                SetSuccess();
            }
            else
            {
                SetFail();
                List<ModelErrorCollection> errors = modelState.Select(x => x.Value.Errors).Where(y => y.Count > 0).ToList();
                foreach (ModelErrorCollection errorCollection in errors)
                {
                    foreach (ModelError error in errorCollection)
                    {
                        ErrorMessages.Add(error.ErrorMessage);
                    }
                }                
            }
        }

        public void SetSuccess()
        {
            IsSuccessful = true;
        }

        public void SetFail(params string[] errors)
        {
            IsSuccessful = false;
            foreach (string str in errors)
                ErrorMessages.Add(str);
        }

        /// <summary>
        /// Converts object to JSON in writes into data
        /// </summary>
        /// <param name="data"></param>
        public void WriteData(object data)
        {
            Data = JsonConvert.SerializeObject(data);
        }
       
    }
}
