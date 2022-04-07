import React, { useState, useEffect } from 'react';
import {Auth} from 'aws-amplify';
import JSONTree from 'react-json-tree';
import AWS from 'aws-sdk';
import AWSConfiguration from './aws-iotcore-configuration.js';

function createAndAttachPolicy(id) {
    var Iot = new AWS.Iot({region: AWSConfiguration.region, apiVersion: AWSConfiguration.apiVersion, endpoint: AWSConfiguration.endpoint});
    var policyName = "amplifyIotReactApp-v3";


    var params = {policyName: policyName};
    Iot.getPolicy(params , function(err, data) {
          if (err) {
               var policyDoc = AWSConfiguration.policy;

                   console.log("Creating policy: " + policyName + " with doc: " + policyDoc);

                   var params = {
                           policyName: policyName,
                           policyDocument: policyDoc
                           };

                   Iot.createPolicy(params , function(err, data) {
                       if (err) {
                            //console.error(err);
                            if (err.code !== 'ResourceAlreadyExistsException') {
                               console.log(err);
                            }
                       }
                       else {
                          console.log("CreatePolicy response=" + data);
                          attachPolicy(id, policyName);
                       }
                   });
          }
          else {
             console.log("Policy " + policyName + " already exists..");
             attachPolicy(id, policyName);
          }
      });
}

function attachPolicy(id, policyName) {
    var Iot = new AWS.Iot({region: AWSConfiguration.region, apiVersion: AWSConfiguration.apiVersion, endpoint: AWSConfiguration.endpoint});
    var params = {policyName: policyName, target: id};

    console.log("Attach IoT Policy: " + policyName + " with cognito identity id: " + id);
    Iot.attachPolicy(params, function(err, data) {
         if (err) {
               //console.error(err);
               if (err.code !== 'ResourceAlreadyExistsException') {
                  console.log(err);
               }
          }
         else  {
            console.log("Successfully attached policy with the identity", data);
         }
     });
}

function AuthDisplay(props) {

    const [essentialCredentials, setEssentialCredentials] = useState({});
        useEffect(() => {
          console.log('useEffect for essentialCredentials triggered.');
          Auth.currentCredentials()
            .then(credentials => {
              setEssentialCredentials(Auth.essentialCredentials(credentials));
              });
        },[]);

    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = AWSConfiguration.region;
    AWS.config.credentials =  essentialCredentials;

    const [cognitoIdentityId, setCognitoIdentityId] = useState({});
    useEffect(() => {
      console.log('useEffect for cognitoIdentityId triggered.');
      Auth.currentCredentials().then((info) => {
        setCognitoIdentityId(info._identityId);
        console.log("Calling Iot to create policy and attaching with cognito identity");
        createAndAttachPolicy(info._identityId);
      });
    },[]);
  

  
    return (
      <div className="AuthDisplay">
        Auth state: {props.authState}
        <br/><br/>
      
        Auth identity ID: {cognitoIdentityId.toString()} 
        <br/><br/>
  
        Auth data:<br/>
        <div className="AuthData">
          <JSONTree data={props.authData} theme={"tomorrow"} invertTheme={true} />
        </div>
        <br/><br/>

        Essential Credentials:<br/>
        <div className="AuthData">
          <JSONTree data={essentialCredentials} theme={"tomorrow"} invertTheme={true} />
        </div>
        <br/><br/>

      </div>
    );
  }

export default AuthDisplay; 