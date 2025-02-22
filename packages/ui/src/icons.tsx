type iconProps = {
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  width?: string;
  height?: string;
  title?: string;
};

export function ArrowRight(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M15.25 9H2.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M11 4.75L15.25 9L11 13.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function Home(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M3.145,6.2l5.25-3.99c.358-.272,.853-.272,1.21,0l5.25,3.99c.249,.189,.395,.484,.395,.796v7.254c0,1.105-.895,2-2,2H4.75c-1.105,0-2-.895-2-2V6.996c0-.313,.146-.607,.395-.796Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function Image(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M14.2501 2.5H3.75012C2.23134 2.5 1.00012 3.73122 1.00012 5.25V12.75C1.00012 14.2688 2.23134 15.5 3.75012 15.5H14.2501C15.7689 15.5 17.0001 14.2688 17.0001 12.75V5.25C17.0001 3.73122 15.7689 2.5 14.2501 2.5Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M13.1944 8.38381C12.1221 7.31151 10.378 7.31151 9.30569 8.38381L2.50259 15.187C2.87879 15.3804 3.2987 15.5 3.75 15.5H14.25C15.7666 15.5 17 14.2666 17 12.75V12.1895L13.1944 8.38381Z"
          fill={fill}
        />
        <path
          d="M5.75012 8.5C6.44048 8.5 7.00012 7.94036 7.00012 7.25C7.00012 6.55964 6.44048 6 5.75012 6C5.05977 6 4.50012 6.55964 4.50012 7.25C4.50012 7.94036 5.05977 8.5 5.75012 8.5Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Video(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <rect
          height="10.5"
          width="14.5"
          fill={secondaryfill}
          opacity=".3"
          rx="2"
          ry="2"
          strokeWidth="0"
          x="1.75"
          y="3.75"
        />
        <rect
          height="10.5"
          width="14.5"
          fill="none"
          rx="2"
          ry="2"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x="1.75"
          y="3.75"
        />
        <rect
          height="6"
          width="7"
          fill={fill}
          rx=".5"
          ry=".5"
          strokeWidth="0"
          x="4"
          y="6"
        />
        <polyline
          fill="none"
          points="12 .75 9 3.75 6.75 1.5"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <circle cx="13" cy="7" fill={fill} r="1" strokeWidth="0" />
        <circle cx="13" cy="10" fill={fill} r="1" strokeWidth="0" />
      </g>
    </svg>
  );
}

export function Typography(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M6.75 15.25H11.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9 2.75V15.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M14.75 4.25L14 2.75H4L3.25 4.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function Grid(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M14.2501 2H11.7501C10.7836 2 10.0001 2.7835 10.0001 3.75V6.25C10.0001 7.2165 10.7836 8 11.7501 8H14.2501C15.2166 8 16.0001 7.2165 16.0001 6.25V3.75C16.0001 2.7835 15.2166 2 14.2501 2Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M6.25012 10H3.75012C2.78362 10 2.00012 10.7835 2.00012 11.75V14.25C2.00012 15.2165 2.78362 16 3.75012 16H6.25012C7.21662 16 8.00012 15.2165 8.00012 14.25V11.75C8.00012 10.7835 7.21662 10 6.25012 10Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M6.25012 2H3.75012C2.78362 2 2.00012 2.7835 2.00012 3.75V6.25C2.00012 7.2165 2.78362 8 3.75012 8H6.25012C7.21662 8 8.00012 7.2165 8.00012 6.25V3.75C8.00012 2.7835 7.21662 2 6.25012 2Z"
          fill={fill}
        />
        <path
          d="M14.2501 10H11.7501C10.7836 10 10.0001 10.7835 10.0001 11.75V14.25C10.0001 15.2165 10.7836 16 11.7501 16H14.2501C15.2166 16 16.0001 15.2165 16.0001 14.25V11.75C16.0001 10.7835 15.2166 10 14.2501 10Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Download(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="m13.75,15.5H4.25c-1.5166,0-2.75-1.2334-2.75-2.75v-7.5c0-1.5166,1.2334-2.75,2.75-2.75h9.5c1.5166,0,2.75,1.2334,2.75,2.75v7.5c0,1.5166-1.2334,2.75-2.75,2.75Z"
          fill={secondaryfill}
          opacity=".4"
          strokeWidth="0"
        />
        <path
          d="m12.5303,8.2197c-.293-.293-.7676-.293-1.0605,0l-1.7197,1.7197V3.25c0-.4141-.3359-.75-.75-.75s-.75.3359-.75.75v6.6895l-1.7197-1.7197c-.1465-.1465-.3384-.2197-.5303-.2197s-.3838.0732-.5303.2197c-.293.293-.293.7676,0,1.0605l3,3c.293.293.7676.293,1.0605,0l3-3c.293-.293.293-.7676,0-1.0605Z"
          fill={fill}
          strokeWidth="0"
        />
      </g>
    </svg>
  );
}

export function Divider(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="m15.25,2v1.75c0,1.1046-.8954,2-2,2H4.75c-1.1046,0-2-.8954-2-2v-1.75h12.5Z"
          fill={secondaryfill}
          opacity=".3"
          strokeWidth="0"
        />
        <path
          d="m15.25,16v-1.75c0-1.1046-.8954-2-2-2H4.75c-1.1046,0-2,.8954-2,2v1.75h12.5Z"
          fill={secondaryfill}
          opacity=".3"
          strokeWidth="0"
        />
        <path
          d="m15.25,2.75v1c0,1.105-.895,2-2,2H4.75c-1.105,0-2-.895-2-2v-1"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m15.25,15.25v-1c0-1.105-.895-2-2-2H4.75c-1.105,0-2,.895-2,2v1"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m2,9h14"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function CircleUser(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M12.842 15.1494C14.8888 13.8679 16.25 11.5929 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 11.5929 3.11118 13.8679 5.15796 15.1494C5.63587 13.4779 7.17505 12.2545 9 12.2545C10.8249 12.2545 12.3641 13.4779 12.842 15.1494ZM9 9.75C10.1046 9.75 11 8.85457 11 7.75C11 6.64543 10.1046 5.75 9 5.75C7.89543 5.75 7 6.64543 7 7.75C7 8.85457 7.89543 9.75 9 9.75Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          d="M9 9.75C10.1046 9.75 11 8.85457 11 7.75C11 6.64543 10.1046 5.75 9 5.75C7.89543 5.75 7 6.64543 7 7.75C7 8.85457 7.89543 9.75 9 9.75Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M5.15399 15.147C5.63299 13.474 7.17299 12.25 8.99999 12.25C10.827 12.25 12.367 13.474 12.846 15.147"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function Button(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M7.40679 10.4561C7.05959 9.504 7.28859 8.4688 8.00399 7.754C8.49369 7.2667 9.13779 6.9996 9.82089 6.9996C10.1222 6.9996 10.419 7.0523 10.7037 7.1558L16.9801 9.4483C16.985 9.3816 17.0001 9.3179 17.0001 9.2501V5.7501C17.0001 4.2335 15.7667 3.0001 14.2501 3.0001H3.75009C2.23349 3.0001 1.00009 4.2335 1.00009 5.7501V9.2501C1.00009 10.7667 2.23349 12.0001 3.75009 12.0001H7.97089L7.40679 10.4561Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M17.0455 11.0693L10.1915 8.5654C9.797 8.4218 9.3634 8.5171 9.0645 8.8144C8.7662 9.1127 8.6709 9.5444 8.8155 9.9414L11.3199 16.7964C11.4752 17.2197 11.878 17.5005 12.3272 17.5005C12.335 17.5005 12.3423 17.5 12.3497 17.5C12.8077 17.4907 13.2096 17.1909 13.3492 16.7544L14.2359 13.9858L17.0054 13.0986C17.4414 12.959 17.7403 12.5571 17.7495 12.0991C17.7593 11.6411 17.4762 11.2275 17.0455 11.0693Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Section(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M14.2501 15H3.75012C3.33602 15 3.00012 15.3359 3.00012 15.75C3.00012 16.1641 3.33602 16.5 3.75012 16.5H14.2501C14.6642 16.5 15.0001 16.1641 15.0001 15.75C15.0001 15.3359 14.6642 15 14.2501 15Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M3.75012 3H14.2501C14.6642 3 15.0001 2.6641 15.0001 2.25C15.0001 1.8359 14.6642 1.5 14.2501 1.5H3.75012C3.33602 1.5 3.00012 1.8359 3.00012 2.25C3.00012 2.6641 3.33602 3 3.75012 3Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M14.2501 5H3.75012C2.23134 5 1.00012 6.23122 1.00012 7.75V10.25C1.00012 11.7688 2.23134 13 3.75012 13H14.2501C15.7689 13 17.0001 11.7688 17.0001 10.25V7.75C17.0001 6.23122 15.7689 5 14.2501 5Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Grip(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M6.75 9.5C7.02614 9.5 7.25 9.27614 7.25 9C7.25 8.72386 7.02614 8.5 6.75 8.5C6.47386 8.5 6.25 8.72386 6.25 9C6.25 9.27614 6.47386 9.5 6.75 9.5Z"
          fill={fill}
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M6.75 4.25C7.02614 4.25 7.25 4.02614 7.25 3.75C7.25 3.47386 7.02614 3.25 6.75 3.25C6.47386 3.25 6.25 3.47386 6.25 3.75C6.25 4.02614 6.47386 4.25 6.75 4.25Z"
          fill={fill}
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M6.75 14.75C7.02614 14.75 7.25 14.5261 7.25 14.25C7.25 13.9739 7.02614 13.75 6.75 13.75C6.47386 13.75 6.25 13.9739 6.25 14.25C6.25 14.5261 6.47386 14.75 6.75 14.75Z"
          fill={fill}
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M11.25 9.5C11.5261 9.5 11.75 9.27614 11.75 9C11.75 8.72386 11.5261 8.5 11.25 8.5C10.9739 8.5 10.75 8.72386 10.75 9C10.75 9.27614 10.9739 9.5 11.25 9.5Z"
          fill={fill}
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M11.25 4.25C11.5261 4.25 11.75 4.02614 11.75 3.75C11.75 3.47386 11.5261 3.25 11.25 3.25C10.9739 3.25 10.75 3.47386 10.75 3.75C10.75 4.02614 10.9739 4.25 11.25 4.25Z"
          fill={fill}
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M11.25 14.75C11.5261 14.75 11.75 14.5261 11.75 14.25C11.75 13.9739 11.5261 13.75 11.25 13.75C10.9739 13.75 10.75 13.9739 10.75 14.25C10.75 14.5261 10.9739 14.75 11.25 14.75Z"
          fill={fill}
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function Trash(props: iconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M15.2501 4H12.0001V2.75C12.0001 1.7852 11.2149 1 10.2501 1H7.75012C6.78532 1 6.00012 1.7852 6.00012 2.75V4H2.75012C2.33602 4 2.00012 4.3359 2.00012 4.75C2.00012 5.1641 2.33602 5.5 2.75012 5.5H15.2501C15.6642 5.5 16.0001 5.1641 16.0001 4.75C16.0001 4.3359 15.6642 4 15.2501 4ZM7.50012 2.75C7.50012 2.6123 7.61242 2.5 7.75012 2.5H10.2501C10.3878 2.5 10.5001 2.6123 10.5001 2.75V4H7.50012V2.75Z"
          fill={fill}
        />
        <path
          d="M11.1026 17H6.89854C5.43564 17 4.22864 15.8555 4.15244 14.394L3.80473 7.78955C3.79403 7.58395 3.86824 7.38326 4.00984 7.23376C4.15144 7.08426 4.34775 6.99988 4.55375 6.99988H13.4473C13.6534 6.99988 13.8497 7.08436 13.9913 7.23376C14.1329 7.38316 14.207 7.58395 14.1963 7.78955L13.8486 14.3945C13.7724 15.8554 12.5655 17 11.1026 17Z"
          fill={secondaryfill}
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
