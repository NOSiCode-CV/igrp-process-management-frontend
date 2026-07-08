import {
  cn,
  Empty as EmptyRoot,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
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
      <EmptyRoot>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IGRPIcon iconName="Settings" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>
            {description}
          </EmptyDescription>
        </EmptyHeader>
      </EmptyRoot>
    </div>
  );
}

export { Empty };
