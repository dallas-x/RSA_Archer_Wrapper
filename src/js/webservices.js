import promise from 'bluebird';
import { soap } from 'strong-soap';

const xml2js = promise.promisifyAll(require('xml2js'));

require('dotenv').config();

const url = `${process.env.base_url}/ws/search.asmx?wsdl`;

function buidl3xml(inc) {
  return `
    <SearchReport>
      <PageSize>250</PageSize>
      <DisplayFields>
          <DisplayField name="Name">16132</DisplayField>
          <DisplayField name="Name">16191</DisplayField>
      </DisplayFields>
      <Criteria>
          <ModuleCriteria>
              <Module name="My App">434</Module>
              <IsKeywordModule>false</IsKeywordModule>
          </ModuleCriteria>
          <Filter>
              <Conditions>
                  <TextFilterCondition>
                      <Operator>Contains</Operator>
                      <Field>16241</Field>
                      <Value>${inc.Threat_Description}</Value>
                  </TextFilterCondition>
                  <TextFilterCondition>
                      <Operator>Contains</Operator>
                      <Field>16236</Field>
                      <Value>${inc.Source_IP}</Value>
                  </TextFilterCondition>
                  <TextFilterCondition>
                      <Operator>Contains</Operator>
                      <Field>16237</Field>
                      <Value>${inc.Destination_IP}</Value>
                  </TextFilterCondition>
              </Conditions>
              <OperatorLogic>1 AND 2 AND 3</OperatorLogic>
          </Filter>
      </Criteria>
    </SearchReport>
  `;
}

function executeSearch(token, searchxml) {
  return new Promise((resolve, reject) => {
    const clientOptions = {};
    const requestArgs = {
      sessionToken: token,
      searchOptions: searchxml,
      pageNumber: 1,
    };
    soap.createClient(url, clientOptions, (createError, client) => {
      client.ExecuteSearch(requestArgs, (methodError, result, envelope, soapHeader) => {
        if (methodError) {
          reject(methodError);
        } else {
          const cleanResult = result.ExecuteSearchResult.replace('\ufeff', '');
          try {
            xml2js.parseStringAsync(cleanResult)
              .then((results) => {
                const { count } = results.Records.$;
                if (count > 0) {
                  const { contentId } = results.Records.Record[0].$;
                  resolve(contentId);
                } else {
                  resolve(null);
                }
              })
              .catch((parseErr) => {
                reject(parseErr);
              });
          } catch (error) {
            throw error;
          }
        }
      });
    });
  });
}

const findPrevious = (token, inc) => {
  return new Promise((resolve, reject) => {
    const searchxml = buidl3xml(inc);
    try {
      executeSearch(token, searchxml)
        .then((contentID) => {
          resolve(contentID);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      throw error;
    }
  });
};

module.exports = findPrevious;
