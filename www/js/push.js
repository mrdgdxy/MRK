/**
 * Copyright 2014 Kinvey, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Push Notification namespace.
var push = {
  // The device ID. Set here because we need it in case of unregistering.
  deviceId: null,

  // Status DOM.
  status: document.getElementById('status'),

  /**
   * Initializes push functionality.
   */
  initialize: function() {
    // Check preconditions.
    if(null == window.plugins.pushNotification) {
      throw new Error('The PushPlugin is not installed.');
    }

    // Bind buttons.
    var register   = document.getElementById('register');
    var unregister = document.getElementById('unregister');
    register.addEventListener('click', push.register, false);
    unregister.addEventListener('click', push.unregister, false);
  },

  /**
   * Registers device for receiving Push Notifications.
   */
  register: function() {
    // Check preconditions.
    if(null != push.deviceId) {
      push.status.innerHTML = 'already registered.';
      return;
    }

    // Register for Android / iOS.
    var pushNotification = window.plugins.pushNotification;
    if('android' === device.platform.toLowerCase()) {// Android.
      pushNotification.register(push.successHandler, push.errorHandler, {
        ecb      : 'push.onNotificationGCM',
        senderID : 'amazing-badge-783'// Google Project ID.
      });
    }
    else {// iOS.
      pushNotification.register(push.tokenHandler, push.errorHandler, {
        alert : 'true',
        badge : 'true',
        sound : 'true',
        ecb   : 'push.onNotificationAPN'
      });
    }
    push.status.innerHTML = 'registering…';
  },

  /**
   * General push success handler.
   */
  successHandler: function(result) {
    push.status.innerHTML = 'result: ' + result;
  },

  /**
   * General push error handler.
   */
  errorHandler: function(error) {
    push.status.innerHTML = 'error: ' + error;
  },

  /**
   * Token handler. Registers device with Kinvey.
   */
  tokenHandler: function(token) {
    push.deviceId = token;// Save.

    // Register device with Kinvey.
    Kinvey.Push.register(token).then(function() {
      push.status.innerHTML = 'registered.';
    }, push.errorHandler);
  },

  /**
   * Android notification handler.
   */
  onNotificationGCM: function(e) {
    if('registered' === e.event) {
      push.tokenHandler(e.regid);
    }
    else if('message' === e.event) {
      navigator.notification.alert(e.payload.msg);
    }
    else if('error' === e.event) {
      push.errorHandler(e.msg);
    }
    else {// Unknown event.
      push.status.innerHTML = e;
    }
  },

  /**
   * iOS notification handler.
   */
  onNotificationAPN: function(event) {
    if(event.alert) {
      navigator.notification.alert(event.alert);
    }
    if(event.sound) {
      var snd = new Media(event.sound);
      snd.play();
    }
    if(event.badge) {
      window.plugins.pushNotification.setApplicationIconBadgeNumber(push.successHandler, push.errorHandler, event.badge)
    }
  },

  /**
   * Unregisters device from receiving Push Notifications.
   */
  unregister: function() {
    // Check preconditions.
    if(null == push.deviceId) {
      push.status.innerHTML = 'already unregistered.';
      return;
    }

    // Unregister.
    push.status.innerHTML = 'unregistering…';

    // Unregister device, and unregister from Kinvey.
    window.plugins.pushNotification.unregister(function() { });
    Kinvey.Push.unregister(push.deviceId).then(function() {
      push.deviceId = null;
      push.status.innerHTML = 'unregistered.';
    }, push.errorHandler);
  }
};