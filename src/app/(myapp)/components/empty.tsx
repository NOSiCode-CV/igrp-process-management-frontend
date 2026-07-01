import {
  cn,
  IGRPEmptyDescriptionPrimitive,
  IGRPEmptyHeaderPrimitive,
  IGRPEmptyMediaPrimitive,
  IGRPEmptyPrimitive,
  IGRPEmptyTitlePrimitive,
  IGRPIcon,
} from "@igrp/igrp-framework-react-design-system";

function Empty({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <IGRPEmptyPrimitive>
        <IGRPEmptyHeaderPrimitive>
          <IGRPEmptyMediaPrimitive variant="icon">
            <IGRPIcon iconName="Settings" />
          </IGRPEmptyMediaPrimitive>
          <IGRPEmptyTitlePrimitive>{title}</IGRPEmptyTitlePrimitive>
          <IGRPEmptyDescriptionPrimitive>
            {description}
          </IGRPEmptyDescriptionPrimitive>
        </IGRPEmptyHeaderPrimitive>
      </IGRPEmptyPrimitive>
    </div>
  );
}

export { Empty };
