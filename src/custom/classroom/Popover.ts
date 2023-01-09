const MoreSettingsPopOver = {
    elevation: 0,
    sx: {
      overflow: "visible",
      marginLeft: "10px",
      bgcolor: "var(--third_blue_color)",
      color: "var(--pure_white_color)",
      border: "1px solid var(--controls_border_color)",
      "&:before": {
        content: '""',
        display: "block",
        position: "absolute",
        top: "50%",
        left: -5,
        width: 10,
        height: 10,
        borderBottom: "1px solid var(--controls_border_color)",
        borderLeft: "1px solid var(--controls_border_color)",
        backgroundColor: "var(--third_blue_color)",
        transform: "translateY(-50%) rotate(45deg)",
        zIndex: 0,
      },
    },
  };
const MoreSettingsMicPopOver = {
    elevation: 0,
    sx: {
      bottom: "75px !important",
      top: "initial !important",
      bgcolor: "var(--third_blue_color)",
      color: "var(--pure_white_color)",
      border: "1px solid var(--controls_border_color)",
      width: "250px",
      overflow: "visible",
      "&:before": {
        content: '""',
        display: "block",
        position: "absolute",
        bottom: -10,
        left: "50%",
        width: 10,
        height: 10,
        transform: "translateY(-50%) rotate(45deg)",
        zIndex: 0,
        borderBottom: "1px solid var(--controls_border_color)",
        borderRight: "1px solid var(--controls_border_color)",
        backgroundColor: "var(--third_blue_color)",
      },
    },
  }

const ChatInputPopOver = {
    elevation: 0,
    sx: {
      bottom: "70px !important",
      top: "initial !important",
      bgcolor: "var(--third_blue_color)",
      color: "var(--pure_white_color)",
      border: "1px solid var(--controls_border_color)",
      overflow: "visible",
      "&:before": {
        content: '""',
        display: "block",
        position: "absolute",
        bottom: -10,
        left: "10%",
        width: 10,
        height: 10,
        transform: "translateY(-50%) rotate(45deg)",
        zIndex: 0,
        borderBottom: "1px solid var(--controls_border_color)",
        borderRight: "1px solid var(--controls_border_color)",
        backgroundColor: "var(--third_blue_color)",
      },
    },
  }

const ControlsPopOver = {
    elevation: 0,
    sx: {
      bottom: "75px !important",
      top: "initial !important",
      bgcolor: "var(--third_blue_color)",
      color: "var(--pure_white_color)",
      border: "1px solid var(--controls_border_color)",
      overflow: "visible",
      "&:before": {
        content: '""',
        display: "block",
        position: "absolute",
        bottom: -10,
        left: "50%",
        width: 10,
        height: 10,
        transform: "translateY(-50%) rotate(45deg)",
        zIndex: 0,
        borderBottom: "1px solid var(--controls_border_color)",
        borderRight: "1px solid var(--controls_border_color)",
        backgroundColor: "var(--third_blue_color)",
      },
    },
  }

const RosterPopover = {
    elevation: 0,
    sx: {
      bgcolor: "var(--third_blue_color)",
      color: "var(--pure_white_color)",
      border: "1px solid var(--controls_border_color)",
      overflow: "visible",
      "&:before": {
        content: '""',
        display: "block",
        position: "absolute",
        top: 0,
        right: "10%",
        width: 10,
        height: 10,
        transform: "translateY(-50%) rotate(45deg)",
        zIndex: 0,
        borderTop: "1px solid var(--controls_border_color)",
        borderLeft: "1px solid var(--controls_border_color)",
        backgroundColor: "var(--third_blue_color)",
      },
    },
  }

export { MoreSettingsPopOver, MoreSettingsMicPopOver, ChatInputPopOver, ControlsPopOver, RosterPopover };