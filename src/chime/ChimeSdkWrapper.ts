// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import {
  AsyncScheduler,
  AudioVideoFacade,
  ConsoleLogger,
  DefaultDeviceController,
  DataMessage,
  DefaultMeetingSession,
  DefaultModality,
  DeviceChangeObserver,
  LogLevel,
  MeetingSession,
  MeetingSessionConfiguration,
  // DefaultActiveSpeakerPolicy,
  DefaultBrowserBehavior
} from 'amazon-chime-sdk-js';
import { useIntl } from 'react-intl';
import throttle from 'lodash/throttle';

import DeviceType from '../types/DeviceType';
import FullDeviceInfoType from '../types/FullDeviceInfoType';
import MessageUpdateCallbackType from '../types/MessageUpdateCallbackType';
import RegionType from '../types/RegionType';
import RosterType from '../types/RosterType';
import commonob from '../constants/common.json'
import OptionalFeature from '../enums/OptionalFeature';
import localStorageKeys from '../constants/localStorageKeys.json';
import { attendanceWenhook } from '../services';

export default class ChimeSdkWrapper implements DeviceChangeObserver {
  intl = useIntl();

  private static DATA_MESSAGE_LIFETIME_MS = 10000;

  private static ROSTER_THROTTLE_MS = 400;

  meetingSession: MeetingSession | null = null;

  audioVideo: AudioVideoFacade | null = null;

  title: string | null = null;

  meetingId: string | null = null;

  name: string | null = null;

  region: string | null = null;

  meetingRecorderName: string = "Unknown";

  endTime: number | null = null;

  browserBehavior = new DefaultBrowserBehavior();

  supportedChimeRegions: RegionType[] = [
    { label: 'United States (N. Virginia)', value: 'us-east-1' },
    { label: 'Japan (Tokyo)', value: 'ap-northeast-1' },
    { label: 'Singapore', value: 'ap-southeast-1' },
    { label: 'Australia (Sydney)', value: 'ap-southeast-2' },
    { label: 'Canada', value: 'ca-central-1' },
    { label: 'Germany (Frankfurt)', value: 'eu-central-1' },
    { label: 'Sweden (Stockholm)', value: 'eu-north-1' },
    { label: 'Ireland', value: 'eu-west-1' },
    { label: 'United Kingdom (London)', value: 'eu-west-2' },
    { label: 'France (Paris)', value: 'eu-west-3' },
    { label: 'Brazil (São Paulo)', value: 'sa-east-1' },
    { label: 'United States (Ohio)', value: 'us-east-2' },
    { label: 'United States (N. California)', value: 'us-west-1' },
    { label: 'United States (Oregon)', value: 'us-west-2' }
  ];

  currentAudioInputDevice: DeviceType | null = null;

  currentAudioOutputDevice: DeviceType | null = null;

  currentVideoInputDevice: DeviceType | null = null;

  audioInputDevices: DeviceType[] = [];

  audioOutputDevices: DeviceType[] = [];

  videoInputDevices: DeviceType[] = [];

  devicesUpdatedCallbacks: ((
    fullDeviceInfo: FullDeviceInfoType
  ) => void)[] = [];

  roster: RosterType = {};

  rosterUpdateCallbacks: ((roster: RosterType) => void)[] = [];

  configuration: MeetingSessionConfiguration | null = null;

  messagingSocket: any | null = null;

  messageUpdateCallbacks: MessageUpdateCallbackType[] = [];

  initializeSdkWrapper = async () => {
    this.meetingSession = null;
    this.audioVideo = null;
    this.title = null;
    this.meetingId = null;
    this.name = null;
    this.region = null;
    this.currentAudioInputDevice = null;
    this.currentAudioOutputDevice = null;
    this.currentVideoInputDevice = null;
    this.audioInputDevices = [];
    this.audioOutputDevices = [];
    this.videoInputDevices = [];
    this.roster = {};
    this.rosterUpdateCallbacks = [];
    this.configuration = null;
    this.messagingSocket = null;
    this.messageUpdateCallbacks = [];
  };

  /*
   * ====================================================================
   * regions
   * ====================================================================
   */
  lookupClosestChimeRegion = async (): Promise<RegionType> => {
    let region: string;
    try {
      const response = await fetch(`https://nearest-media-region.l.chime.aws`, {
        method: 'GET'
      });
      const json = await response.json();
      if (json.error) {
        throw new Error(
          `${this.intl.formatMessage({
            id: 'CreateOrJoin.serverError'
          })}: ${json.error}`
        );
      }
      region = json.region;
    } catch (error) {
      this.logError(error);
    }
    return (
      this.supportedChimeRegions.find(({ value }) => value === region) ||
      this.supportedChimeRegions[0]
    );
  };

  createRoom = async (
    meetingName: string,
    meetingID: string | null,
    id: string,
    batchId: string,
    userName: string | null,
    userID: string,
    duration: string,
    isRecording: string,
    role: string | null,
    optionalFeature: string | null
  ): Promise<void> => {
    if (!meetingID || !userName || !role) {
      this.logError(
        new Error(
          `title=${meetingID} name=${userName} role=${role} must exist`
        )
      );
      throw new Error(
        `Provide valid meeting details`
      )
      return;
    }
    if (!localStorage.getItem(localStorageKeys.MEETING_CONFIG)){
    const response = await fetch(
      `${commonob.getBaseUrl}join?title=${encodeURIComponent(meetingID)}&name=${encodeURIComponent(userName)}&region=${encodeURIComponent("us-east-1")}&role=${encodeURIComponent(role)}&meetingName=${encodeURIComponent(meetingName)}&id=${encodeURIComponent(id)}&batchId=${encodeURIComponent(batchId)}&userID=${encodeURIComponent(userID)}&duration=${encodeURIComponent(duration)}&isRecording=${encodeURIComponent(isRecording)}`,
      {
        method: 'POST'
      }
    );
    const json = await response.json();
    if (json.error) {
      throw new Error(
        `${this.intl.formatMessage({
          id: 'CreateOrJoin.serverError'
        })}: ${json.error}`
      );
    }

    const { JoinInfo } = json;
    if (!JoinInfo) {
      throw new Error(
        this.intl.formatMessage({
          id: 'CreateOrJoin.classRoomDoesNotExist'
        })
      );
    }
    localStorage.setItem(localStorageKeys.MEETING_CONFIG,JSON.stringify(JoinInfo));

    this.configuration = new MeetingSessionConfiguration(
      JoinInfo.Meeting,
      JoinInfo.Attendee
    );
    if (optionalFeature === OptionalFeature.Simulcast) {
      this.configuration.enableUnifiedPlanForChromiumBasedBrowsers = true;
      this.configuration.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = true;
    }
    await this.initializeMeetingSession(this.configuration);

    this.title = meetingID;
    this.name = userName;
    this.region = 'us-east-1';
    this.endTime = JoinInfo.EndTime;
    this.meetingId = JoinInfo.Meeting.MeetingId;
    // if(role === "teacher"){
    //   localStorage.setItem('hostId', JoinInfo.Attendee.AttendeeId);
    // }
    // if(JoinInfo.Attendee.host){
    //   localStorage.setItem('hostId', JoinInfo.Attendee.AttendeeId);
    // }
    localStorage.setItem(localStorageKeys.CURRENT_MEETING_ID, JoinInfo.Meeting.MeetingId);
    localStorage.setItem(localStorageKeys.CURRENT_ATTENDEE_ID, JoinInfo.Attendee.AttendeeId);

    if(role !== "teacher"){
      const webhookRes = {
        meetingId: meetingID,
        internal_meeting_id: JoinInfo.Meeting.MeetingId,
        user_id: userID,
        batch_id: batchId,
        isJoin: true
      }
      
      console.log("🏣🏣🏣🏣",webhookRes)
      await attendanceWenhook(webhookRes);
    }
  }else{
    const joinInfo = JSON.parse(localStorage.getItem(localStorageKeys.MEETING_CONFIG) as string);
    this.configuration = new MeetingSessionConfiguration(
      joinInfo.Meeting,
      joinInfo.Attendee
    );
    if (optionalFeature === OptionalFeature.Simulcast) {
      this.configuration.enableUnifiedPlanForChromiumBasedBrowsers = true;
      this.configuration.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = true;
    }
    await this.initializeMeetingSession(this.configuration);

    this.title = meetingID;
    this.name = userName;
    this.endTime = joinInfo.EndTime;
    this.region = 'us-east-1';
    this.meetingId = joinInfo.Meeting.MeetingId;
  }
  };

  initializeMeetingSession = async (
    configuration: MeetingSessionConfiguration
  ): Promise<void> => {
    console.log("🚅🚅🚅🚅",configuration)
    const logger = new ConsoleLogger('SDK', LogLevel.OFF);
    const deviceController = new DefaultDeviceController(logger);
    this.meetingSession = new DefaultMeetingSession(
      configuration,
      logger,
      deviceController
    );
    this.audioVideo = this.meetingSession.audioVideo;
    // set video local video quality 180p,360p,720p
    // this.audioVideo.chooseVideoInputQuality(1280, 720, 15,1400);

    this.audioInputDevices = [];
    (await this.audioVideo?.listAudioInputDevices()).forEach(
      (mediaDeviceInfo: MediaDeviceInfo) => {
        this.audioInputDevices.push({
          name: mediaDeviceInfo.label,
          value: mediaDeviceInfo.deviceId
        });
      }
    );
    this.audioOutputDevices = [];
    (await this.audioVideo?.listAudioOutputDevices()).forEach(
      (mediaDeviceInfo: MediaDeviceInfo) => {
        this.audioOutputDevices.push({
          name: mediaDeviceInfo.label,
          value: mediaDeviceInfo.deviceId
        });
      }
    );
    this.videoInputDevices = [];
    (await this.audioVideo?.listVideoInputDevices()).forEach(
      (mediaDeviceInfo: MediaDeviceInfo) => {
        this.videoInputDevices.push({
          name: mediaDeviceInfo.label,
          value: mediaDeviceInfo.deviceId
        });
      }
    );
    this.publishDevicesUpdated();
    this.audioVideo?.addDeviceChangeObserver(this);

    this.audioVideo?.realtimeSubscribeToAttendeeIdPresence(
      (presentAttendeeId: string, present: boolean): void => {
        if (!present) {
          delete this.roster[presentAttendeeId];
          this.publishRosterUpdate.cancel();
          this.publishRosterUpdate();
          return;
        }

        this.audioVideo?.realtimeSubscribeToVolumeIndicator(
          presentAttendeeId,
          async (
            attendeeId: string,
            volume: number | null,
            muted: boolean | null,
            signalStrength: number | null
          ) => {
            const baseAttendeeId = new DefaultModality(attendeeId).base();
            if (baseAttendeeId !== attendeeId) {
              // Don't include the content attendee in the roster.
              //
              // When you or other attendees share content (a screen capture, a video file,
              // or any other MediaStream object), the content attendee (attendee-id#content) joins the session and
              // shares content as if a regular attendee shares a video.
              //
              // For example, your attendee ID is "my-id". When you call meetingSession.audioVideo.startContentShare,
              // the content attendee "my-id#content" will join the session and share your content.
              return;
            }

            let shouldPublishImmediately = false;

            if (!this.roster[attendeeId]) {
              this.roster[attendeeId] = { name: '' };
            }
            if (volume !== null) {
              this.roster[attendeeId].volume = Math.round(volume * 100);
            }
            if (muted !== null) {
              this.roster[attendeeId].muted = muted;
            }
            if (signalStrength !== null) {
              this.roster[attendeeId].signalStrength = Math.round(
                signalStrength * 100
              );
            }

            if (this.title && attendeeId && !this.roster[attendeeId].name && attendeeId !== localStorage.getItem(localStorageKeys.CURRENT_RECORDER_ID)) {
              const response = await fetch(
                `${commonob.getBaseUrl}attendee?title=${encodeURIComponent(
                  this.title
                )}&attendee=${encodeURIComponent(attendeeId)}`
              );
              const json = await response.json();
              
              if(this.roster[this.meetingSession?.configuration.credentials?.attendeeId as string]?.name === this.meetingRecorderName){
                this.audioVideo?.realtimeMuteLocalAudio();
              }

              if(json.AttendeeInfo.Name === this.meetingRecorderName && attendeeId !== this.meetingSession?.configuration.credentials?.attendeeId){
                localStorage.setItem(localStorageKeys.CURRENT_RECORDER_ID,attendeeId);
                delete this.roster[presentAttendeeId];
                this.publishRosterUpdate();
                return;
              }
              this.roster[attendeeId].name = json.AttendeeInfo?.Name || '';
              this.roster[attendeeId].msgCount = 0;
              this.roster[attendeeId].presenter = false;
              this.roster[attendeeId].raised = false;
              this.roster[attendeeId].host = json.AttendeeInfo?.Host || false;

              shouldPublishImmediately = true;
            }

            if (shouldPublishImmediately) {
              this.publishRosterUpdate.cancel();
            }
            this.publishRosterUpdate();
          }
        );
      }
    );

    // this.audioVideo.subscribeToActiveSpeakerDetector(
    //   new DefaultActiveSpeakerPolicy(),
    //   (attendeeIds: string[]): void => {
    //     Object.keys(this.roster).forEach(attendeeId => {
    //       this.roster[attendeeId].active = false;
    //     });

    //     attendeeIds.some(attendeeId => {
    //       if (this.roster[attendeeId]) {
    //         this.roster[attendeeId].active = true;
    //         return true; // only show the most active speaker
    //       }
    //       return false;
    //     });
    //   }
    // );
  };

  // UPDATE MESSAGE COUNTER FOR PURTICULAR ATTENDEE
  updateChatMessageCounter = (attendeeId: string, count: number) => { 
      this.roster[attendeeId].msgCount = count;
      this.publishRosterUpdate();
  }

  // UPDATE SCREEN SHARE PRESENTER  
  updateScreenPresenter = (attendeeId: string, flag: boolean) => { 
      this.roster[attendeeId].presenter = flag;
      this.publishRosterUpdate();
  }

  // UPDATE SCREEN SHARE PRESENTER  
  updateRaisedHand = (attendeeId: string, flag: boolean) => { 
      this.roster[attendeeId].raised = flag;
      this.publishRosterUpdate();
  }

  joinRoom = async (element: HTMLAudioElement | null): Promise<void> => {
    if (!element) {
      this.logError(new Error(`element does not exist`));
      return;
    }

    window.addEventListener(
      'unhandledrejection',
      (event: PromiseRejectionEvent) => {
        this.logError(event.reason);
      }
    );

    const audioInputs =
    (await this.audioVideo?.listAudioInputDevices()) || [];
  const audioOutputs =
    (await this.audioVideo?.listAudioOutputDevices()) || [];
  const videoInputs =
    (await this.audioVideo?.listVideoInputDevices()) || [];

    if (audioInputs && audioInputs.length > 0 && audioInputs[0].deviceId) {
      this.currentAudioInputDevice = {
        name: audioInputs[0].label,
        value: audioInputs[0].deviceId
      };
      await this.audioVideo?.chooseAudioInputDevice(audioInputs[0].deviceId);
    }

    if (audioOutputs && audioOutputs.length > 0 && audioOutputs[0].deviceId &&
      this.browserBehavior.supportsSetSinkId()) {
      this.currentAudioOutputDevice = {
        name: audioOutputs[0].label,
        value: audioOutputs[0].deviceId
      };
      await this.audioVideo?.chooseAudioOutputDevice(audioOutputs[0].deviceId);
    }

    if (videoInputs && videoInputs.length > 0 && videoInputs[0].deviceId) {
      this.currentVideoInputDevice = {
        name: videoInputs[0].label,
        value: videoInputs[0].deviceId
      };
      await this.audioVideo?.chooseVideoInputDevice(null);
    }

    this.publishDevicesUpdated();

    this.audioVideo?.bindAudioElement(element);
    this.audioVideo?.start();
  };

  // eslint-disable-next-line
  sendMessage = (topic: string, data: any) => {
    new AsyncScheduler().start(() => {
      this.audioVideo?.realtimeSendDataMessage(
        topic,
        data,
        ChimeSdkWrapper.DATA_MESSAGE_LIFETIME_MS
      );
      this.publishMessageUpdate(
        new DataMessage(
          Date.now(),
          topic,
          new TextEncoder().encode(data),
          this.meetingSession?.configuration.credentials?.attendeeId || '',
          this.meetingSession?.configuration.credentials?.externalUserId || ''
        )
      );
    });
  };

  leaveRoom = async (end: boolean): Promise<void> => {
    try {
      this.audioVideo?.chooseVideoInputDevice(null);
      this.audioVideo?.stopLocalVideoTile();
      this.audioVideo?.stop();
    } catch (error) {
      this.logError(error);
    }

    try {
      if (end && this.title) {
        await fetch(
          `${commonob.getBaseUrl}end?title=${encodeURIComponent(this.title)}`,
          {
            method: 'POST'
          }
        );
      }
    } catch (error) {
      this.logError(error);
    }
    localStorage.clear();
    this.initializeSdkWrapper();
  };

  /**
   * ====================================================================
   * Device
   * ====================================================================
   */

  chooseAudioInputDevice = async (device: DeviceType) => {
    try {
      await this.audioVideo?.chooseAudioInputDevice(device.value);
      this.currentAudioInputDevice = device;
      this.publishDevicesUpdated();
    } catch (error) {
      this.logError(error);
    }
  };

  chooseAudioOutputDevice = async (device: DeviceType) => {
    if (!this.browserBehavior.supportsSetSinkId()) {
      return;
    }

    try {
      await this.audioVideo?.chooseAudioOutputDevice(device.value);
      this.currentAudioOutputDevice = device;
      this.publishDevicesUpdated();
    } catch (error) {
      this.logError(error);
    }
  };

  chooseVideoInputDevice = async (device: DeviceType) => {
    try {
      await this.audioVideo?.chooseVideoInputDevice(device.value);
      this.currentVideoInputDevice = device;
      this.publishDevicesUpdated();
    } catch (error) {
      this.logError(error);
    }
  };

  /**
   * ====================================================================
   * Observer methods
   * ====================================================================
   */

  audioInputsChanged(freshAudioInputDeviceList: MediaDeviceInfo[]): void {
    let hasCurrentDevice = false;
    this.audioInputDevices = [];
    freshAudioInputDeviceList.forEach((mediaDeviceInfo: MediaDeviceInfo) => {
      if (
        this.currentAudioInputDevice &&
        mediaDeviceInfo.deviceId === this.currentAudioInputDevice.value
      ) {
        hasCurrentDevice = true;
      }
      this.audioInputDevices.push({
        name: mediaDeviceInfo.label,
        value: mediaDeviceInfo.deviceId
      });
    });
    if (!hasCurrentDevice) {
      this.currentAudioInputDevice =
        this.audioInputDevices.length > 0 ? this.audioInputDevices[0] : null;
    }
    this.publishDevicesUpdated();
  }

  audioOutputsChanged(freshAudioOutputDeviceList: MediaDeviceInfo[]): void {
    let hasCurrentDevice = false;
    this.audioOutputDevices = [];
    freshAudioOutputDeviceList.forEach((mediaDeviceInfo: MediaDeviceInfo) => {
      if (
        this.currentAudioOutputDevice &&
        mediaDeviceInfo.deviceId === this.currentAudioOutputDevice.value
      ) {
        hasCurrentDevice = true;
      }
      this.audioOutputDevices.push({
        name: mediaDeviceInfo.label,
        value: mediaDeviceInfo.deviceId
      });
    });
    if (!hasCurrentDevice) {
      this.currentAudioOutputDevice =
        this.audioOutputDevices.length > 0 ? this.audioOutputDevices[0] : null;
    }
    this.publishDevicesUpdated();
  }

  videoInputsChanged(freshVideoInputDeviceList: MediaDeviceInfo[]): void {
    let hasCurrentDevice = false;
    this.videoInputDevices = [];
    freshVideoInputDeviceList.forEach((mediaDeviceInfo: MediaDeviceInfo) => {
      if (
        this.currentVideoInputDevice &&
        mediaDeviceInfo.deviceId === this.currentVideoInputDevice.value
      ) {
        hasCurrentDevice = true;
      }
      this.videoInputDevices.push({
        name: mediaDeviceInfo.label,
        value: mediaDeviceInfo.deviceId
      });
    });
    if (!hasCurrentDevice) {
      this.currentVideoInputDevice =
        this.videoInputDevices.length > 0 ? this.videoInputDevices[0] : null;
    }
    this.publishDevicesUpdated();
  }

  /**
   * ====================================================================
   * Subscribe and unsubscribe from SDK events
   * ====================================================================
   */

  subscribeToDevicesUpdated = (
    callback: (fullDeviceInfo: FullDeviceInfoType) => void
  ) => {
    this.devicesUpdatedCallbacks.push(callback);
  };

  unsubscribeFromDevicesUpdated = (
    callback: (fullDeviceInfo: FullDeviceInfoType) => void
  ) => {
    const index = this.devicesUpdatedCallbacks.indexOf(callback);
    if (index !== -1) {
      this.devicesUpdatedCallbacks.splice(index, 1);
    }
  };

  private publishDevicesUpdated = () => {
    this.devicesUpdatedCallbacks.forEach(
      (callback: (fullDeviceInfo: FullDeviceInfoType) => void) => {
        callback({
          currentAudioInputDevice: this.currentAudioInputDevice,
          currentAudioOutputDevice: this.currentAudioOutputDevice,
          currentVideoInputDevice: this.currentVideoInputDevice,
          audioInputDevices: this.audioInputDevices,
          audioOutputDevices: this.audioOutputDevices,
          videoInputDevices: this.videoInputDevices
        });
      }
    );
  };

  subscribeToRosterUpdate = (callback: (roster: RosterType) => void) => {
    this.rosterUpdateCallbacks.push(callback);
  };

  unsubscribeFromRosterUpdate = (callback: (roster: RosterType) => void) => {
    const index = this.rosterUpdateCallbacks.indexOf(callback);
    if (index !== -1) {
      this.rosterUpdateCallbacks.splice(index, 1);
    }
  };

  private publishRosterUpdate = throttle(() => {
    for (let i = 0; i < this.rosterUpdateCallbacks.length; i += 1) {
      const callback = this.rosterUpdateCallbacks[i];
      callback(this.roster);
    }
  }, ChimeSdkWrapper.ROSTER_THROTTLE_MS);

  subscribeToMessageUpdate = (
    messageUpdateCallback: MessageUpdateCallbackType
  ) => {
    this.messageUpdateCallbacks.push(messageUpdateCallback);
    this.audioVideo?.realtimeSubscribeToReceiveDataMessage(
      messageUpdateCallback.topic,
      messageUpdateCallback.callback
    );
  };

  unsubscribeFromMessageUpdate = (
    messageUpdateCallback: MessageUpdateCallbackType
  ) => {
    const index = this.messageUpdateCallbacks.indexOf(messageUpdateCallback);
    if (index !== -1) {
      this.messageUpdateCallbacks.splice(index, 1);
    }
    this.audioVideo?.realtimeUnsubscribeFromReceiveDataMessage(
      messageUpdateCallback.topic
    );
  };

  private publishMessageUpdate = (message: DataMessage) => {
    for (let i = 0; i < this.messageUpdateCallbacks.length; i += 1) {
      const messageUpdateCallback = this.messageUpdateCallbacks[i];
      if (messageUpdateCallback.topic === message.topic) {
        messageUpdateCallback.callback(message);
      }
    }
  };

  /**
   * ====================================================================
   * Utilities
   * ====================================================================
   */
  private logError = (error: any) => {
    // eslint-disable-next-line
    console.error(error);
  };
}
