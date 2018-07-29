import passport from 'passport';
import { Strategy } from 'passport-local';
import axios from 'axios';

require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = function localStrategy() {
  passport.use(new Strategy(
    {
      usernameField: 'userName',
      passwordField: 'password',
    },
    (username, password, done) => {
      try {
        const loginUrl = `${process.env.base_url}/api/core/security/login`;
        const body = {
          InstanceName: process.env.instance_name,
          Username: username,
          UserDomain: process.env.user_domain,
          Password: password,
        };
        axios.post(loginUrl, body)
          .then((response) => {
            if (response.data.IsSuccessful === true) {
              const user = {
                token: response.data.RequestedObject.SessionToken,
                userId: response.data.UserId,
                userName: username,
              };
              done(null, user);
            } else {
              done(null, false);
            }
          })
          .catch((error) => {
            done(error, false);
          });
      } catch (error) {
        done(error, false);
      }
    },
  ));
};
