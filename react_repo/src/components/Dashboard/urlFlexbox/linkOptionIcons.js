import React from "react";
import { Popover } from "antd";
import { ReactComponent as CautionLogo} from '../../../img/media/caution.svg';
import { ReactComponent as ChildrenLogo} from '../../../img/media/children.svg';
import { ReactComponent as PoliticsLogo} from '../../../img/media/politics.svg';
import { ReactComponent as PromotionsLogo} from '../../../img/media/promotions.svg';
import { ReactComponent as WorkLogo} from '../../../img/media/work.svg';
import "./urlFlexbox.scss";

export const LinkOptionIcons = ({
    contains_violence,
    not_child,
    contains_politics,
    contains_promotions,
    not_work
}) => {
    return (
        <div className="linkOptionIcons">

            {contains_violence && contains_violence === 1 ?
                <Popover content="Contains violence, profanity, graphic content, etc.">
                    <CautionLogo className="icon" />
                </Popover>
                : ``
            }

            {not_child && not_child === 1 ?
                <Popover content="Not suitable for kids">
                    <ChildrenLogo className="icon" />
                </Popover>
                : ``
            }
            
            {contains_politics && contains_politics === 1 ?
                <Popover content="Contains Politics">
                    <PoliticsLogo className="icon" />
                </Popover>
                : ``
            }
            
            {contains_promotions && contains_promotions === 1 ?
                <Popover content="Contains Promotions">
                    <PromotionsLogo className="icon" />
                </Popover>
                : ``
            }
            
            {not_work && not_work === 1 ?
                <Popover content="Not suitable for work">
                    <WorkLogo className="icon" />
                </Popover>
                : ``
            }

        </div>
    )
}