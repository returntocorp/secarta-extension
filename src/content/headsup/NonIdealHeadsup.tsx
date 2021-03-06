import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l, li } from "@r2c/extension/analytics";
import { PreflightChecklistErrors } from "@r2c/extension/content/headsup/PreflightFetch";
import { PreflightProjectState } from "@r2c/extension/content/headsup/PreflightProjectState";
import SimpleHeadsup from "@r2c/extension/content/headsup/SimpleHeadsup";
import { MainToaster } from "@r2c/extension/content/Toaster";
import {
  LoadingIcon,
  MissingIcon,
  UnsupportedIcon
} from "@r2c/extension/icons";
import {
  ExtensionState,
  toggleExtensionExperiment
} from "@r2c/extension/shared/ExtensionState";
import * as React from "react";
import { ExtensionContext } from "../index";
import "./NonIdealHeadsup.css";

enum HeadsupDisplayState {
  Open,
  DisplayOptions,
  Closed
}

interface UnsupportedMessageState {
  displayed: HeadsupDisplayState;
}

interface ClosedHeadsupProps {
  displayed: HeadsupDisplayState;
  extensionState: ExtensionState;
  closeMessage: React.MouseEventHandler;
  onDismissAlways(
    extensionState: ExtensionState
  ): React.MouseEventHandler<HTMLElement>;
}

export class CloseHeadsupButton extends React.PureComponent<
  ClosedHeadsupProps
> {
  public render() {
    const {
      displayed,
      extensionState,
      closeMessage,
      onDismissAlways
    } = this.props;

    return (
      <>
        {displayed === HeadsupDisplayState.DisplayOptions && (
          <span className="hide-options">
            <Button
              id="hide-always-button"
              minimal={true}
              small={true}
              onClick={l(
                "preflight-hide-always-click",
                onDismissAlways(extensionState)
              )}
              intent={Intent.DANGER}
            >
              Always hide if unsupported
            </Button>
          </span>
        )}

        <Button
          icon={IconNames.SMALL_CROSS}
          minimal={true}
          small={true}
          onClick={closeMessage}
        />
      </>
    );
  }
}

export class UnsupportedHeadsUp extends React.PureComponent<
  {},
  UnsupportedMessageState
> {
  public state: UnsupportedMessageState = {
    displayed: HeadsupDisplayState.Open
  };

  public render() {
    if (this.state.displayed === HeadsupDisplayState.Closed) {
      return null;
    }
    li("preflight-unsupported-repo-load");

    return (
      <ExtensionContext.Consumer>
        {({ extensionState }) => {
          if (
            extensionState != null &&
            !extensionState.experiments.hideOnUnsupported
          ) {
            return (
              <SimpleHeadsup
                status="unsupported"
                icon={<UnsupportedIcon />}
                headline="Preflight currently only supports JavaScript and TypeScript projects that have been published to npm."
                rightSide={
                  <CloseHeadsupButton
                    displayed={this.state.displayed}
                    extensionState={extensionState}
                    closeMessage={this.closeMessage}
                    onDismissAlways={this.handleDismissAlways}
                  />
                }
              />
            );
          } else {
            return null;
          }
        }}
      </ExtensionContext.Consumer>
    );
  }

  private handleDismissAlways: (
    extensionState: ExtensionState
  ) => React.MouseEventHandler<HTMLElement> = extensionState => e => {
    toggleExtensionExperiment(extensionState, "hideOnUnsupported");
    this.setState({ displayed: HeadsupDisplayState.Closed });
  };

  private closeMessage: React.MouseEventHandler<HTMLElement> = e => {
    if (this.state.displayed === HeadsupDisplayState.DisplayOptions) {
      this.setState({ displayed: HeadsupDisplayState.Closed });
    } else {
      this.setState({ displayed: HeadsupDisplayState.DisplayOptions });
    }
  };
}

export class FileIssueActionButton extends React.PureComponent {
  public render() {
    return (
      <div className="repo-headsup-issue">
        Want to help?{" "}
        <AnchorButton
          text="File an issue"
          onClick={l("preflight-file-issue-click", this.handleFileActionClick)}
          href="https://github.com/returntocorp/preflight-extension/issues/new?template=report-bad-data.md"
          minimal={true}
          intent="primary"
        />
      </div>
    );
  }
  private handleFileActionClick: React.MouseEventHandler = () => {
    MainToaster.show({
      message:
        "Thanks for letting us know. We'll take a look and make it right.",
      icon: IconNames.HEART
    });
  };
}

export class MissingDataHeadsUp extends React.PureComponent {
  public render() {
    return (
      <SimpleHeadsup
        status="missing"
        icon={<MissingIcon />}
        headline="Preflight couldn't find any data for this project. We're looking
            into it."
        rightSide={<FileIssueActionButton />}
      />
    );
  }
}

interface ErrorHeadsUpProps {
  projectState: PreflightProjectState;
  error: PreflightChecklistErrors | Error | React.ErrorInfo | string;
}

interface ErrorHeadsUpState {
  showDetails: boolean;
}

export class ErrorHeadsUp extends React.PureComponent<
  ErrorHeadsUpProps,
  ErrorHeadsUpState
> {
  public state: ErrorHeadsUpState = {
    showDetails: false
  };

  public render() {
    const hasError = Object.getOwnPropertyNames(this.props.error).length > 0;

    return (
      <>
        <SimpleHeadsup
          status="error"
          icon={<MissingIcon />}
          headline={`
    Couldn't load Preflight. Check that api.secarta.io is
              whitelisted in your browser.`}
          rightSide={this.renderRight(hasError)}
        />
        {this.state.showDetails && (
          <div className="error-details">
            <pre className="error-code">{this.props.projectState}</pre>
            <pre className="error-raw">{JSON.stringify(this.props.error)}</pre>
          </div>
        )}
      </>
    );
  }

  private renderRight(hasError: boolean) {
    if (hasError) {
      return (
        <div className="error-briefing-action">
          <Button
            onClick={l(
              `preflight-error-${
                this.state.showDetails ? "show-less" : "show-details"
              }-button-click`,
              this.handleToggleShowDetails
            )}
            className="error-message-show-more"
            small={true}
            minimal={true}
          >
            Show {this.state.showDetails ? "less" : "details"}
          </Button>
        </div>
      );
    } else {
      return null;
    }
  }

  private handleToggleShowDetails: React.MouseEventHandler<HTMLElement> = e =>
    this.setState({ showDetails: !this.state.showDetails });
}

export class LoadingHeadsUp extends React.PureComponent {
  public state: UnsupportedMessageState = {
    displayed: HeadsupDisplayState.Open
  };

  public render() {
    if (this.state.displayed === HeadsupDisplayState.Closed) {
      return null;
    }

    return (
      <SimpleHeadsup
        status="loading"
        icon={<LoadingIcon />}
        headline="Contacting tower ..."
      />
    );
  }
}
