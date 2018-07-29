function incBody(inc, contentId) {
  return new Promise((resolve, reject) => {
    try {
      const incTitle = `${inc.Detection_Type}-${inc.Threat_Description}-${inc.Source_IP}`;
      const incSummary = `${inc.Detection_Type} detected: Threat ${inc.Threat_Description} from Source ${inc.Source_IP}`;
      const incDetails = `${inc.Severity} severity ${inc.Detection_Type} from Host: ${inc.Hostname}
          / Source IP: ${inc.Source_IP} --->>> Destination IP: ${inc.Destination_IP} on Port: ${inc.Destination_port}`;
      const source = inc.IDS_Code;
      const incidentBody =
                    {
                      Content: {
                        LevelId: 232,
                        FieldContents: {
                          16132: { Type: 1, Value: incTitle, FieldId: 16132 },
                          16108: { Type: 1, Value: incSummary, FieldId: 16108 },
                          16109: { Type: 1, Value: incDetails, FieldId: 16109 },
                          16172: { Type: 4, Value: { ValuesListIds: [source], OtherText: null }, FieldId: 16172 },
                          16114: { Type: 4, Value: { ValuesListIds: [66329], OtherText: null }, FieldId: 16114 },
                        },
                      },
                    };
      if (contentId) {
      // create based on previous alert
        incidentBody.Content.FieldContents[16195] =
{ Type: 9, Value: [{ ContentId: contentId, LevelId: 232 }], FieldId: 16195 };
        resolve(incidentBody);
      } else {
        resolve(incidentBody);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function alertBody(alert, refId) {
  return new Promise((resolve, reject) => {
    try {
      const body =
                  {
                    Content: {
                      LevelId: 233,
                      FieldContents: {
                        16191: { Type: 9, Value: [{ ContentId: refId, LevelId: 232 }], FieldId: 16191 },
                        16241: { Type: 1, Value: alert.Threat_Description, FieldId: 16241 },
                        16236: { Type: 1, Value: alert.Source_IP, FieldId: 16236 },
                        16237: { Type: 1, Value: alert.Destination_IP, FieldId: 16237 },
                        16235: { Type: 1, Value: alert.Source_MAC_Address, FieldId: 16235 },
                        16220: { Type: 2, Value: alert.Destination_port, FieldId: 16220 },
                        16218: { Type: 2, Value: alert.Source_Port, FieldId: 16218 },
                        16261: { Type: 1, Value: alert.Source_Hostname, FieldId: 16261 },
                        16262: { Type: 1, Value: alert.Destination_Hostname, FieldId: 16262 },
                        16213: { Type: 1, Value: alert.Source_MAC_Address, FieldId: 16213 },
                        16246: { Type: 1, Value: alert.Severity, FieldId: 16246 },
                        16263: { Type: 1, Value: alert.IDS, FieldId: 16263 },
                        16254: { Type: 1, Value: alert.Detection_Type, FieldId: 16254 },
                        16315: { Type: 1, Value: alert.Hostname, FieldId: 16315 },
                        16299: { Type: 1, Value: alert.Threat_Description, FieldId: 16299 },
                        16248: { Type: 1, Value: alert.Threat_Detection, FieldId: 16248 },
                        16273: { Type: 3, Value: alert.Date, FieldId: 16273 },
                      },
                    },
                  };
      resolve(body);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { incBody, alertBody };
