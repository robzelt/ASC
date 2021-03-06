﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureServiceCatalog.Web.Models.Billing
{
    public class Properties
    {
        public Properties()
        {
            InfoFields = new InfoFields();
        }
        public string SubscriptionId { get; set; }
        public string UsageStartTime { get; set; }
        public string UsageEndTime { get; set; }
        public string MeterId { get; set; }
        public InfoFields InfoFields { get; set; }

        [JsonProperty("instanceData")]
        public string InstanceDataRaw { get; set; }

        public InstanceDataType InstanceData
        {
            get
            {
                return JsonConvert.DeserializeObject<InstanceDataType>(InstanceDataRaw.Replace("\\\"", ""));
            }
        }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public string MeterName { get; set; }
        public string MeterCategory { get; set; }
        public string MeterSubCategory { get; set; }
        public string MeterRegion { get; set; }
    }
}