import { l } from "@r2c/extension/analytics";
import { CriteriaEntry } from "@r2c/extension/api/criteria";
import { CheckmarkIcon } from "@r2c/extension/icons";
import * as classnames from "classnames";
import * as React from "react";
import "./SimpleHeadsup.css";

interface SimpleHeadsupProps {
  criteria?: CriteriaEntry;
  isExpanded?: boolean;
  status: "safe" | "danger" | "warning" | "missing" | "unsupported" | "loading";
  icon: React.ReactChild;
  headline: string;
  handleClickChecksButton?: React.MouseEventHandler;
  showAllChecksButton: boolean;
  rightSide?: React.ReactChild;
}

export default class SimpleHeadsup extends React.PureComponent<
  SimpleHeadsupProps
> {
  public render() {
    const {
      isExpanded,
      status,
      icon,
      headline,
      handleClickChecksButton,
      showAllChecksButton,
      rightSide
    } = this.props;

    const simpleStyle = isExpanded
      ? "simple-headsup detailed"
      : "simple-headsup";

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          `${simpleStyle}`,
          `${status}`
        )}
      >
        <div className="simple-left">
          {icon}
          <div className="simple-headsup-headline">{headline}</div>
        </div>
        <div className="simple-right">
          {showAllChecksButton
            ? this.renderRight(handleClickChecksButton, isExpanded)
            : rightSide}
        </div>
      </div>
    );
  }

  private renderRight(
    handleClickChecksButton: React.MouseEventHandler | undefined,
    isExpanded: boolean | undefined
  ) {
    return (
      <React.Fragment>
        <span className="simple-headsup-timestamp">
          Updated 2 weeks ago &middot;{" "}
        </span>
        <span className="simple-headsup-show">
          <a
            onClick={l(
              "preflight-show-checks-button-click",
              handleClickChecksButton
            )}
            role="button"
          >
            {this.renderShow(isExpanded)}
          </a>
        </span>
      </React.Fragment>
    );
  }

  private renderShow(isExpanded: boolean | undefined) {
    return isExpanded ? "Hide all checks" : "Show all checks";
  }
}

interface SimpleHeadsupWrapperProps {
  criteria: CriteriaEntry;
  children: React.ReactChild;
}

interface SimpleHeadsupWrapperState {
  showMore: boolean;
}

export class SimpleHeadsupWrapper extends React.PureComponent<
  SimpleHeadsupWrapperProps,
  SimpleHeadsupWrapperState
> {
  public state: SimpleHeadsupWrapperState = {
    showMore: false
  };

  public render() {
    const { criteria, children } = this.props;
    const { showMore } = this.state;

    return (
      <>
        <SimpleHeadsup
          criteria={criteria}
          isExpanded={showMore}
          status="safe"
          icon={<CheckmarkIcon />}
          headline="Preflight"
          handleClickChecksButton={this.handleShowAllChecks}
          showAllChecksButton={true}
        />
        <div className={!showMore ? "hidden" : ""}>{children}</div>
      </>
    );
  }

  private handleShowAllChecks: React.MouseEventHandler = () =>
    this.setState({ showMore: !this.state.showMore });
}
