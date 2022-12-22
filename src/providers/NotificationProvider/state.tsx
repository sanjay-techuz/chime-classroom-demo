import { v4 as uuidv4 } from 'uuid';

export enum Variant {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
}

export enum Positions {
  BOTTOM_RIGHT = 'bottom-right',
  CENTER = 'center',
}

export interface NotificationType {
  id?: string;
  message?: string;
  variant?: string;
  replaceAll?: boolean;
  position?: Positions;
  messageType?: string;
  vertical?: string;
  horizontal?: string;
  background?: string;
  color?: string;
}

export interface StateType {
  notifications: NotificationType[];
}

export enum Type {
  MUTE_MESSAGE,
  POOR_INTERNET_CONNECTION,
  REMOVE_POOR_INTERNET_CONNECTION,
  REMOTE_UNMUTE,
  REMOTE_MUTE,
  REMOTE_VIDEO_ENABLED,
  REMOTE_VIDEO_DISABLED,
  REMOTE_AUTO_FOCUS,
  SCREEN_SHARE_PERMIT,
  ADD,
  REMOVE,
  REMOVE_ALL
}

export interface Action {
  type: Type;
  payload?: any;
}

export const initialState: StateType = {
  notifications: []
};

export const reducer = (state: StateType, action: Action): StateType => {
  const { type, payload } = action;

  switch (type) {
    case Type.ADD: {
      const notif = { id: uuidv4(), ...payload };
      const notifications = notif?.replaceAll
        ? [notif]
        : [...state.notifications, notif];
      return {
        ...state,
        notifications,
      };
    }
    case Type.REMOVE: {
      const notifications = state.notifications.filter(
        notif => notif?.id !== payload
      );
      return {
        ...state,
        notifications,
      };
    }
  
    case Type.REMOVE_ALL: {
      return {
        ...state,
        notifications: []
      };
    }

    case Type.POOR_INTERNET_CONNECTION: {
      if(state.notifications.filter(i => i.messageType === 'POOR_INTERNET_CONNECTION').length > 0){
        return {
          ...state,
        }; 
      }
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: uuidv4(),
            message: payload.message,
            variant: Variant.WARNING,
            background: "var(--color_yellow)",
            color: "var(--color_black)",
            vertical: "top",
            horizontal: "center",
            messageType: "POOR_INTERNET_CONNECTION"
          },
        ],
      };
    }
    case Type.REMOVE_POOR_INTERNET_CONNECTION: {
      const notifications = state.notifications.filter(
        notif => notif?.messageType !== payload
      );
      return {
        ...state,
        notifications,
      };
    }

    case Type.REMOTE_MUTE: {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: uuidv4(),
            message: payload.message,
            variant: Variant.INFO,
            vertical: "top",
            horizontal: "center",
            background: "var(--third_blue_color)",
            messageType: 'REMOTE_MUTE',
          },
        ],
      };
    }
    case Type.REMOTE_UNMUTE: {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: uuidv4(),
            message: payload.message,
            variant: Variant.INFO,
            vertical: "top",
            horizontal: "center",
            background: "var(--third_blue_color)",
            messageType: 'REMOTE_UNMUTE',
          },
        ],
      };
    }
    case Type.REMOTE_VIDEO_ENABLED: {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: uuidv4(),
            message: payload.message,
            variant: Variant.INFO,
            vertical: "top",
            horizontal: "center",
            background: "var(--third_blue_color)",
            messageType: 'REMOTE_VIDEO_ENABLED',
          },
        ],
      };
    }
    case Type.REMOTE_VIDEO_DISABLED: {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: uuidv4(),
            message: payload.message,
            variant: Variant.INFO,
            vertical: "top",
            horizontal: "center",
            background: "var(--third_blue_color)",
            messageType: 'REMOTE_VIDEO_DISABLED',
          },
        ],
      };
    }
    case Type.REMOTE_AUTO_FOCUS: {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: uuidv4(),
            message: payload.message,
            variant: Variant.INFO,
            vertical: "top",
            horizontal: "center",
            background: "var(--third_blue_color)",
            messageType: 'REMOTE_AUTO_FOCUS',
          },
        ],
      };
    }
    case Type.SCREEN_SHARE_PERMIT: {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: uuidv4(),
            message: payload.message,
            variant: Variant.INFO,
            vertical: "top",
            horizontal: "center",
            background: "var(--third_blue_color)",
            messageType: 'SCREEN_SHARE_PERMIT',
          },
        ],
      };
    }


    default:
      throw new Error('Incorrect type in NotificationProvider');
  }
};
