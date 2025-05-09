type IconProps = {
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  width?: string;
  height?: string;
  title?: string;
};

export function ChurchSpaceBlack(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 185 291"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none">
        <path
          d="M142.177 23.3423H173.437C179.612 23.3423 184.617 28.3479 184.617 34.5227V258.318C184.617 264.493 179.612 269.498 173.437 269.498H142.177V23.3423Z"
          fill={fill}
        />
        <path
          d="M0 57.5604C0 52.8443 2.9699 48.6392 7.41455 47.0622L125.19 5.27404C132.441 2.70142 140.054 8.07871 140.054 15.7722V275.171C140.054 282.801 132.557 288.172 125.332 285.718L7.55682 245.715C3.03886 244.18 0 239.939 0 235.167V57.5604Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function ChurchSpaceWhite(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      style={{}}
      width={width}
      viewBox="0 0 185 291"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none">
        <path
          d="M142.177 23.3423H173.437C179.612 23.3423 184.617 28.3479 184.617 34.5227V258.318C184.617 264.493 179.612 269.498 173.437 269.498H142.177V23.3423Z"
          fill="url(#1740415042667-4866285_paint0_linear_69_17)"
        />
        <path
          d="M0 57.5604C0 52.8443 2.9699 48.6392 7.41455 47.0622L125.19 5.27404C132.441 2.70142 140.054 8.07871 140.054 15.7722V275.171C140.054 282.801 132.557 288.172 125.332 285.718L7.55682 245.715C3.03886 244.18 0 239.939 0 235.167V57.5604Z"
          fill="#fff"
        />
        <defs>
          <linearGradient
            id="1740415042667-4866285_paint0_linear_69_17"
            gradientUnits="userSpaceOnUse"
            x1="177.19"
            x2="142.177"
            y1="129.444"
            y2="129.444"
          >
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#EEE" />
          </linearGradient>
        </defs>
      </g>
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
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

export function Home(props: IconProps) {
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

export function Image(props: IconProps) {
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

export function Video(props: IconProps) {
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

export function Typography(props: IconProps) {
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

export function Grid(props: IconProps) {
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

export function Download(props: IconProps) {
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

export function Divider(props: IconProps) {
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

export function CircleUser(props: IconProps) {
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

export function Button(props: IconProps) {
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

export function Section(props: IconProps) {
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

export function Grip(props: IconProps) {
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

export function Trash(props: IconProps) {
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

export function Youtube(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path d="M31.331,8.248c-.368-1.386-1.452-2.477-2.829-2.848-2.496-.673-12.502-.673-12.502-.673,0,0-10.007,0-12.502,.673-1.377,.37-2.461,1.462-2.829,2.848-.669,2.512-.669,7.752-.669,7.752,0,0,0,5.241,.669,7.752,.368,1.386,1.452,2.477,2.829,2.847,2.496,.673,12.502,.673,12.502,.673,0,0,10.007,0,12.502-.673,1.377-.37,2.461-1.462,2.829-2.847,.669-2.512,.669-7.752,.669-7.752,0,0,0-5.24-.669-7.752ZM12.727,20.758V11.242l8.364,4.758-8.364,4.758Z" />
      </g>
    </svg>
  );
}

export function YoutubeFilled(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || "white";
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path d="M31.331,8.248c-.368-1.386-1.452-2.477-2.829-2.848-2.496-.673-12.502-.673-12.502-.673,0,0-10.007,0-12.502,.673-1.377,.37-2.461,1.462-2.829,2.848-.669,2.512-.669,7.752-.669,7.752,0,0,0,5.241,.669,7.752,.368,1.386,1.452,2.477,2.829,2.847,2.496,.673,12.502,.673,12.502,.673,0,0,10.007,0,12.502-.673,1.377-.37,2.461-1.462,2.829-2.847,.669-2.512,.669-7.752,.669-7.752,0,0,0-5.24-.669-7.752Z" />
      </g>
      <path
        fill={secondaryfill}
        d="M12.727,20.758V11.242l8.364,4.758-8.364,4.758Z"
      />
    </svg>
  );
}

export function XTwitter(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path d="M18.42,14.009L27.891,3h-2.244l-8.224,9.559L10.855,3H3.28l9.932,14.455L3.28,29h2.244l8.684-10.095,6.936,10.095h7.576l-10.301-14.991h0Zm-3.074,3.573l-1.006-1.439L6.333,4.69h3.447l6.462,9.243,1.006,1.439,8.4,12.015h-3.447l-6.854-9.804h0Z" />
      </g>
    </svg>
  );
}

export function TikTok(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path d="M24.562,7.613c-1.508-.983-2.597-2.557-2.936-4.391-.073-.396-.114-.804-.114-1.221h-4.814l-.008,19.292c-.081,2.16-1.859,3.894-4.039,3.894-.677,0-1.315-.169-1.877-.465-1.288-.678-2.169-2.028-2.169-3.582,0-2.231,1.815-4.047,4.046-4.047,.417,0,.816,.069,1.194,.187v-4.914c-.391-.053-.788-.087-1.194-.087-4.886,0-8.86,3.975-8.86,8.86,0,2.998,1.498,5.65,3.783,7.254,1.439,1.01,3.19,1.606,5.078,1.606,4.886,0,8.86-3.975,8.86-8.86V11.357c1.888,1.355,4.201,2.154,6.697,2.154v-4.814c-1.345,0-2.597-.4-3.647-1.085Z" />
      </g>
    </svg>
  );
}

export function Threads(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path d="M22.7,14.977c-.121-.058-.243-.113-.367-.167-.216-3.982-2.392-6.262-6.046-6.285-.017,0-.033,0-.05,0-2.185,0-4.003,.933-5.122,2.63l2.009,1.378c.836-1.268,2.147-1.538,3.113-1.538,.011,0,.022,0,.033,0,1.203,.008,2.111,.357,2.698,1.04,.428,.497,.714,1.183,.855,2.049-1.067-.181-2.22-.237-3.453-.166-3.474,.2-5.707,2.226-5.557,5.041,.076,1.428,.788,2.656,2.003,3.459,1.028,.678,2.351,1.01,3.727,.935,1.817-.1,3.242-.793,4.236-2.06,.755-.963,1.233-2.21,1.444-3.781,.866,.523,1.507,1.21,1.862,2.037,.603,1.405,.638,3.714-1.246,5.596-1.651,1.649-3.635,2.363-6.634,2.385-3.326-.025-5.842-1.091-7.478-3.171-1.532-1.947-2.323-4.759-2.353-8.359,.03-3.599,.821-6.412,2.353-8.359,1.636-2.079,4.151-3.146,7.478-3.171,3.35,.025,5.91,1.097,7.608,3.186,.833,1.025,1.461,2.313,1.874,3.815l2.355-.628c-.502-1.849-1.291-3.443-2.365-4.764-2.177-2.679-5.361-4.051-9.464-4.08h-.016c-4.094,.028-7.243,1.406-9.358,4.095-1.882,2.393-2.853,5.722-2.886,9.895v.01s0,.01,0,.01c.033,4.173,1.004,7.503,2.886,9.895,2.115,2.689,5.264,4.067,9.358,4.095h.016c3.64-.025,6.206-.978,8.32-3.09,2.765-2.763,2.682-6.226,1.771-8.352-.654-1.525-1.901-2.763-3.605-3.581Zm-6.285,5.909c-1.522,.086-3.104-.598-3.182-2.061-.058-1.085,.772-2.296,3.276-2.441,.287-.017,.568-.025,.844-.025,.909,0,1.76,.088,2.533,.257-.288,3.602-1.98,4.187-3.471,4.269Z" />
      </g>
    </svg>
  );
}

export function Linkedin(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M26.111,3H5.889c-1.595,0-2.889,1.293-2.889,2.889V26.111c0,1.595,1.293,2.889,2.889,2.889H26.111c1.595,0,2.889-1.293,2.889-2.889V5.889c0-1.595-1.293-2.889-2.889-2.889ZM10.861,25.389h-3.877V12.87h3.877v12.519Zm-1.957-14.158c-1.267,0-2.293-1.034-2.293-2.31s1.026-2.31,2.293-2.31,2.292,1.034,2.292,2.31-1.026,2.31-2.292,2.31Zm16.485,14.158h-3.858v-6.571c0-1.802-.685-2.809-2.111-2.809-1.551,0-2.362,1.048-2.362,2.809v6.571h-3.718V12.87h3.718v1.686s1.118-2.069,3.775-2.069,4.556,1.621,4.556,4.975v7.926Z"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
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
          d="M8.5,6.827c-.352,.168-.682,.398-.973,.69l-.01,.01c-1.381,1.381-1.381,3.619,0,5l2.175,2.175c1.381,1.381,3.619,1.381,5,0l.01-.01c1.381-1.381,1.381-3.619,0-5l-.931-.931"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9.5,11.173c.352-.168,.682-.398,.973-.69l.01-.01c1.381-1.381,1.381-3.619,0-5l-2.175-2.175c-1.381-1.381-3.619-1.381-5,0l-.01,.01c-1.381,1.381-1.381,3.619,0,5l.931,.931"
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

export function Instagram(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path d="M10.202,2.098c-1.49,.07-2.507,.308-3.396,.657-.92,.359-1.7,.84-2.477,1.619-.776,.779-1.254,1.56-1.61,2.481-.345,.891-.578,1.909-.644,3.4-.066,1.49-.08,1.97-.073,5.771s.024,4.278,.096,5.772c.071,1.489,.308,2.506,.657,3.396,.359,.92,.84,1.7,1.619,2.477,.779,.776,1.559,1.253,2.483,1.61,.89,.344,1.909,.579,3.399,.644,1.49,.065,1.97,.08,5.771,.073,3.801-.007,4.279-.024,5.773-.095s2.505-.309,3.395-.657c.92-.36,1.701-.84,2.477-1.62s1.254-1.561,1.609-2.483c.345-.89,.579-1.909,.644-3.398,.065-1.494,.081-1.971,.073-5.773s-.024-4.278-.095-5.771-.308-2.507-.657-3.397c-.36-.92-.84-1.7-1.619-2.477s-1.561-1.254-2.483-1.609c-.891-.345-1.909-.58-3.399-.644s-1.97-.081-5.772-.074-4.278,.024-5.771,.096m.164,25.309c-1.365-.059-2.106-.286-2.6-.476-.654-.252-1.12-.557-1.612-1.044s-.795-.955-1.05-1.608c-.192-.494-.423-1.234-.487-2.599-.069-1.475-.084-1.918-.092-5.656s.006-4.18,.071-5.656c.058-1.364,.286-2.106,.476-2.6,.252-.655,.556-1.12,1.044-1.612s.955-.795,1.608-1.05c.493-.193,1.234-.422,2.598-.487,1.476-.07,1.919-.084,5.656-.092,3.737-.008,4.181,.006,5.658,.071,1.364,.059,2.106,.285,2.599,.476,.654,.252,1.12,.555,1.612,1.044s.795,.954,1.051,1.609c.193,.492,.422,1.232,.486,2.597,.07,1.476,.086,1.919,.093,5.656,.007,3.737-.006,4.181-.071,5.656-.06,1.365-.286,2.106-.476,2.601-.252,.654-.556,1.12-1.045,1.612s-.955,.795-1.608,1.05c-.493,.192-1.234,.422-2.597,.487-1.476,.069-1.919,.084-5.657,.092s-4.18-.007-5.656-.071M21.779,8.517c.002,.928,.755,1.679,1.683,1.677s1.679-.755,1.677-1.683c-.002-.928-.755-1.679-1.683-1.677,0,0,0,0,0,0-.928,.002-1.678,.755-1.677,1.683m-12.967,7.496c.008,3.97,3.232,7.182,7.202,7.174s7.183-3.232,7.176-7.202c-.008-3.97-3.233-7.183-7.203-7.175s-7.182,3.233-7.174,7.203m2.522-.005c-.005-2.577,2.08-4.671,4.658-4.676,2.577-.005,4.671,2.08,4.676,4.658,.005,2.577-2.08,4.671-4.658,4.676-2.577,.005-4.671-2.079-4.676-4.656h0" />
      </g>
    </svg>
  );
}

export function Facebook(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z" />
      </g>
    </svg>
  );
}

export function MailFilled(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="m10,9.905l7.937-3.527c-.301-1.909-1.944-3.378-3.937-3.378H6c-1.993,0-3.636,1.469-3.937,3.378l7.937,3.527Z"
          fill={secondaryfill}
          strokeWidth="0"
        />
        <path
          d="m10.812,11.733c-.258.115-.535.172-.812.172s-.555-.057-.813-.172l-7.187-3.194v4.461c0,2.206,1.794,4,4,4h8c2.206,0,4-1.794,4-4v-4.461l-7.188,3.195Z"
          fill={fill}
          strokeWidth="0"
        />
      </g>
    </svg>
  );
}

export function Bluesky(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path d="M23.931,5.298c-3.21,2.418-6.663,7.32-7.931,9.951-1.267-2.631-4.721-7.533-7.931-9.951-2.316-1.744-6.069-3.094-6.069,1.201,0,.857,.49,7.206,.778,8.237,.999,3.583,4.641,4.497,7.881,3.944-5.663,.967-7.103,4.169-3.992,7.372,5.908,6.083,8.492-1.526,9.154-3.476,.123-.36,.179-.527,.179-.379,0-.148,.057,.019,.179,.379,.662,1.949,3.245,9.558,9.154,3.476,3.111-3.203,1.671-6.405-3.992-7.372,3.24,.553,6.882-.361,7.881-3.944,.288-1.031,.778-7.38,.778-8.237,0-4.295-3.753-2.945-6.069-1.201Z" />
      </g>
    </svg>
  );
}

export function List(props: IconProps) {
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
          d="M15.2501 3H10.2501C9.83602 3 9.50012 3.3359 9.50012 3.75C9.50012 4.1641 9.83602 4.5 10.2501 4.5H15.2501C15.6642 4.5 16.0001 4.1641 16.0001 3.75C16.0001 3.3359 15.6642 3 15.2501 3Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M15.2501 6H10.2501C9.83602 6 9.50012 6.3359 9.50012 6.75C9.50012 7.1641 9.83602 7.5 10.2501 7.5H15.2501C15.6642 7.5 16.0001 7.1641 16.0001 6.75C16.0001 6.3359 15.6642 6 15.2501 6Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M15.2501 10.5H10.2501C9.83602 10.5 9.50012 10.8359 9.50012 11.25C9.50012 11.6641 9.83602 12 10.2501 12H15.2501C15.6642 12 16.0001 11.6641 16.0001 11.25C16.0001 10.8359 15.6642 10.5 15.2501 10.5Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M15.2501 13.5H10.2501C9.83602 13.5 9.50012 13.8359 9.50012 14.25C9.50012 14.6641 9.83602 15 10.2501 15H15.2501C15.6642 15 16.0001 14.6641 16.0001 14.25C16.0001 13.8359 15.6642 13.5 15.2501 13.5Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M6.25012 2H3.75012C2.78362 2 2.00012 2.7835 2.00012 3.75V6.25C2.00012 7.2165 2.78362 8 3.75012 8H6.25012C7.21662 8 8.00012 7.2165 8.00012 6.25V3.75C8.00012 2.7835 7.21662 2 6.25012 2Z"
          fill={fill}
        />
        <path
          d="M6.25012 10H3.75012C2.78362 10 2.00012 10.7835 2.00012 11.75V14.25C2.00012 15.2165 2.78362 16 3.75012 16H6.25012C7.21662 16 8.00012 15.2165 8.00012 14.25V11.75C8.00012 10.7835 7.21662 10 6.25012 10Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function File(props: IconProps) {
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
          d="M10.75 1.83956C10.6212 1.78103 10.4801 1.75 10.336 1.75H4.75C3.645 1.75 2.75 2.645 2.75 3.75V14.25C2.75 15.355 3.645 16.25 4.75 16.25H13.25C14.355 16.25 15.25 15.355 15.25 14.25V6.664C15.25 6.51978 15.2189 6.37883 15.1603 6.24999H11.75C11.198 6.24999 10.75 5.80199 10.75 5.24999V1.83956Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          d="M5.75 6.75H7.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M5.75 9.75H12.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M5.75 12.75H12.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M2.75 14.25V3.75C2.75 2.645 3.645 1.75 4.75 1.75H10.336C10.601 1.75 10.856 1.855 11.043 2.043L14.957 5.957C15.145 6.145 15.25 6.399 15.25 6.664V14.25C15.25 15.355 14.355 16.25 13.25 16.25H4.75C3.645 16.25 2.75 15.355 2.75 14.25Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.16 6.24999H11.75C11.198 6.24999 10.75 5.80199 10.75 5.24999V1.85199"
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

export function PlayButton(props: IconProps) {
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
          d="M15.1,7.478L5.608,2.222c-.553-.306-1.206-.297-1.749,.023-.538,.317-.859,.877-.859,1.499V14.256c0,.622,.321,1.182,.859,1.499,.279,.164,.586,.247,.895,.247,.293,0,.586-.075,.854-.223l9.491-5.256c.556-.307,.901-.891,.901-1.522s-.345-1.215-.9-1.522Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Plus(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <line
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          x1="10.75"
          x2="1.25"
          y1="6"
          y2="6"
        />
        <line
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          x1="6"
          x2="6"
          y1="10.75"
          y2="1.25"
        />
      </g>
    </svg>
  );
}

export function ChevronLeft(props: IconProps) {
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
          d="M11.5 15.25L5.25 9L11.5 2.75"
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

export function ChevronRight({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M13.28 8.46999L7.03 2.21999C6.737 1.92699 6.262 1.92699 5.969 2.21999C5.676 2.51299 5.676 2.98803 5.969 3.28103L11.689 9.001L5.969 14.721C5.676 15.014 5.676 15.489 5.969 15.782C6.115 15.928 6.307 16.002 6.499 16.002C6.691 16.002 6.883 15.929 7.029 15.782L13.279 9.53201C13.572 9.23901 13.572 8.76403 13.279 8.47103L13.28 8.46999Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Undo(props: IconProps) {
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
          d="M3 10C3.528 9.53902 5.7 7.74902 9 7.74902C12.3 7.74902 14.472 9.53902 15 10"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M4.625 5.59802L3 10L7.53 11.222"
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

export function Redo(props: IconProps) {
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
          d="M15,10c-.528-.461-2.7-2.251-6-2.251s-5.472,1.79-6,2.251"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <polyline
          fill="none"
          points="13.375 5.598 15 10 10.47 11.222"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function XIcon(props: IconProps) {
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
          d="M14 4L4 14"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M4 4L14 14"
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

export function LoaderIcon(props: IconProps) {
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
          d="M9 1.75V4.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M14.127 3.873L12.359 5.641"
          fill="none"
          opacity="0.88"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M16.25 9H13.75"
          fill="none"
          opacity="0.75"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M14.127 14.127L12.359 12.359"
          fill="none"
          opacity="0.63"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9 16.25V13.75"
          fill="none"
          opacity="0.5"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M3.87299 14.127L5.64099 12.359"
          fill="none"
          opacity="0.38"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M1.75 9H4.25"
          fill="none"
          opacity="0.25"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M3.87299 3.873L5.64099 5.641"
          fill="none"
          opacity="0.13"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function CirclePlus({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9.00012 17C13.4184 17 17.0001 13.4183 17.0001 9C17.0001 4.58172 13.4184 1 9.00012 1C4.58184 1 1.00012 4.58172 1.00012 9C1.00012 13.4183 4.58184 17 9.00012 17Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M12.2501 8.25H9.75012V5.75C9.75012 5.3359 9.41422 5 9.00012 5C8.58602 5 8.25012 5.3359 8.25012 5.75V8.25H5.75012C5.33602 8.25 5.00012 8.5859 5.00012 9C5.00012 9.4141 5.33602 9.75 5.75012 9.75H8.25012V12.25C8.25012 12.6641 8.58602 13 9.00012 13C9.41422 13 9.75012 12.6641 9.75012 12.25V9.75H12.2501C12.6642 9.75 13.0001 9.4141 13.0001 9C13.0001 8.5859 12.6642 8.25 12.2501 8.25Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Palette({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="m8.3034,16.217c-3.7776-.3601-6.7098-3.619-6.5469-7.5271.157-3.7659,3.3501-6.8755,7.1188-6.9388,4.0612-.0683,7.3747,3.2034,7.3747,7.2489h0c0,1.5188-1.2312,2.75-2.75,2.75h-2.963c-1.0336,0-1.6928,1.1036-1.2027,2.0137l.2374.4409c.2597.4823.2062,1.0732-.1361,1.501h0c-.2736.342-.6962.553-1.1322.5115Z"
          fill={secondaryfill}
          opacity=".3"
          strokeWidth="0"
        />
        <path
          d="m8.3034,16.217c-3.7776-.3601-6.7098-3.619-6.5469-7.5271.157-3.7659,3.3501-6.8755,7.1188-6.9388,4.0612-.0683,7.3747,3.2034,7.3747,7.2489h0c0,1.5188-1.2312,2.75-2.75,2.75h-2.963c-1.0336,0-1.6928,1.1036-1.2027,2.0137l.2374.4409c.2597.4823.2062,1.0732-.1361,1.501h0c-.2736.342-.6962.553-1.1322.5115Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <circle cx="9" cy="5" fill={fill} r="1" strokeWidth="0" />
        <circle cx="6.1716" cy="6.1716" fill={fill} r="1" strokeWidth="0" />
        <circle cx="11.8284" cy="6.1716" fill={fill} r="1" strokeWidth="0" />
        <circle cx="5" cy="9" fill={fill} r="1" strokeWidth="0" />
      </g>
    </svg>
  );
}

export function FooterIcon(props: IconProps) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "1em";
  const height = props.height || "1em";
  const title = props.title || "layout footer";

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M14.2501 2H3.75012C2.23352 2 1.00012 3.2334 1.00012 4.75V13C1.00012 13.4141 1.33602 13.75 1.75012 13.75H16.2501C16.6642 13.75 17.0001 13.4141 17.0001 13V4.75C17.0001 3.2334 15.7667 2 14.2501 2Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M14.2501 10H3.75012C2.23134 10 1.00012 11.2312 1.00012 12.75V13.25C1.00012 14.7688 2.23134 16 3.75012 16H14.2501C15.7689 16 17.0001 14.7688 17.0001 13.25V12.75C17.0001 11.2312 15.7689 10 14.2501 10Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function TemplatesIcon({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M7.25011 15.4999C6.73841 15.4999 6.28231 15.1928 6.08901 14.7177C5.93281 14.3329 5.4943 14.1503 5.1124 14.3051C4.7286 14.4609 4.544 14.8984 4.7003 15.2822C5.1241 16.3257 6.12511 17 7.25011 17C7.66421 17 8.00011 16.6641 8.00011 16.25C8.00011 15.8359 7.66421 15.4999 7.25011 15.4999Z"
          fill={fill}
        />
        <path
          d="M11.7501 15.5H9.75012C9.33602 15.5 9.00012 15.8359 9.00012 16.25C9.00012 16.6641 9.33602 17 9.75012 17H11.7501C12.1642 17 12.5001 16.6641 12.5001 16.25C12.5001 15.8359 12.1642 15.5 11.7501 15.5Z"
          fill={fill}
        />
        <path
          d="M16.2501 13.5C15.836 13.5 15.5001 13.8359 15.5001 14.25C15.5001 14.9395 14.9396 15.5 14.2501 15.5C13.836 15.5 13.5001 15.8359 13.5001 16.25C13.5001 16.6641 13.836 17 14.2501 17C15.7667 17 17.0001 15.7666 17.0001 14.25C17.0001 13.8359 16.6642 13.5 16.2501 13.5Z"
          fill={fill}
        />
        <path
          d="M16.2501 9C15.836 9 15.5001 9.3359 15.5001 9.75V11.75C15.5001 12.1641 15.836 12.5 16.2501 12.5C16.6642 12.5 17.0001 12.1641 17.0001 11.75V9.75C17.0001 9.3359 16.6642 9 16.2501 9Z"
          fill={fill}
        />
        <path
          d="M15.2813 4.69976C14.8995 4.54496 14.46 4.72955 14.3047 5.11385C14.1494 5.49765 14.335 5.93464 14.7188 6.09044C15.1934 6.28234 15.5 6.73794 15.5 7.25014C15.5 7.66424 15.8359 8.00014 16.25 8.00014C16.6641 8.00014 17 7.66424 17 7.25014C17 6.12364 16.3253 5.12266 15.2813 4.69976Z"
          fill={fill}
        />
        <path
          d="M10.7501 1H3.75012C2.23134 1 1.00012 2.23122 1.00012 3.75V10.75C1.00012 12.2688 2.23134 13.5 3.75012 13.5H10.7501C12.2689 13.5 13.5001 12.2688 13.5001 10.75V3.75C13.5001 2.23122 12.2689 1 10.7501 1Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
      </g>
    </svg>
  );
}

export function Battery({
  fill = "currentColor",
  secondaryfill = "currentColor",
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M13.75 4.25H3.75C2.64543 4.25 1.75 5.14543 1.75 6.25V11.75C1.75 12.8546 2.64543 13.75 3.75 13.75H13.75C14.8546 13.75 15.75 12.8546 15.75 11.75V6.25C15.75 5.14543 14.8546 4.25 13.75 4.25Z"
          fill={secondaryfill}
          stroke="none"
        />
        <path
          d="M13.75 4.25H3.75C2.64543 4.25 1.75 5.14543 1.75 6.25V11.75C1.75 12.8546 2.64543 13.75 3.75 13.75H13.75C14.8546 13.75 15.75 12.8546 15.75 11.75V6.25C15.75 5.14543 14.8546 4.25 13.75 4.25Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M17.25 7.75H15.75V10.25H17.25V7.75Z"
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

export function Wifi({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M10.061,14.47c-.192,0-.384-.073-.531-.22-.282-.283-.777-.283-1.06,0-.293,.293-.768,.292-1.061,0-.293-.293-.293-.768,0-1.061,.85-.85,2.333-.85,3.183,0,.292,.293,.292,.768,0,1.061-.146,.146-.338,.219-.53,.219Z"
          fill={secondaryfill}
        />
        <path
          d="M12.182,12.348c-.192,0-.384-.073-.53-.22-1.462-1.462-3.842-1.462-5.304,0-.293,.293-.768,.293-1.061,0s-.293-.768,0-1.061c2.047-2.047,5.378-2.047,7.425,0,.293,.293,.293,.768,0,1.061-.146,.146-.338,.22-.53,.22Z"
          fill={fill}
        />
        <path
          d="M14.303,10.227c-.192,0-.384-.073-.53-.22-2.632-2.632-6.914-2.632-9.546,0-.293,.293-.768,.293-1.061,0s-.293-.768,0-1.061c3.217-3.217,8.45-3.217,11.667,0,.293,.293,.293,.768,0,1.061-.146,.146-.338,.22-.53,.22Z"
          fill={secondaryfill}
        />
        <path
          d="M16.425,8.105c-.192,0-.384-.073-.53-.22-3.802-3.801-9.987-3.801-13.789,0-.293,.293-.768,.293-1.061,0s-.293-.768,0-1.061c4.387-4.386,11.523-4.386,15.91,0,.293,.293,.293,.768,0,1.061-.146,.146-.338,.22-.53,.22Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Signal({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M2.75 12.75V14.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M5.75 10.25V14.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9 7.75V14.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M12.25 5.25V14.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.25 2.75V14.25"
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

export function CloudUpload({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M13.464 6.891C13.278 4.577 11.362 2.75 9 2.75C6.515 2.75 4.5 4.765 4.5 7.25C4.5 7.6 4.549 7.936 4.624 8.263C3.027 8.33 1.75 9.637 1.75 11.25C1.75 12.907 3.093 14.25 4.75 14.25H12.5C14.571 14.25 16.25 12.571 16.25 10.5C16.25 8.764 15.065 7.318 13.464 6.891Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M13.464 6.891C13.278 4.577 11.362 2.75 9 2.75C6.515 2.75 4.5 4.765 4.5 7.25C4.5 7.6 4.549 7.936 4.624 8.263C3.027 8.33 1.75 9.637 1.75 11.25C1.75 12.907 3.093 14.25 4.75 14.25H12.5C14.571 14.25 16.25 12.571 16.25 10.5C16.25 8.764 15.065 7.318 13.464 6.891Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M6.75 9L9 6.75L11.25 9"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9 6.75V11.75"
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

export function EmailError({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M1.75 5.64296L8.565 9.54C8.84 9.673 9.16 9.673 9.434 9.54L16.25 5.64239V5.25C16.25 4.14543 15.3546 3.25 14.25 3.25H3.75C2.64543 3.25 1.75 4.14543 1.75 5.25V5.64296Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          d="M1.75 5.75L8.517 9.483C8.818 9.649 9.182 9.649 9.483 9.483L16.25 5.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M16.25 9.898V5.25C16.25 4.146 15.355 3.25 14.25 3.25H3.75C2.645 3.25 1.75 4.146 1.75 5.25V12.75C1.75 13.854 2.645 14.75 3.75 14.75H6.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.5 16.75H15.899C16.694 16.75 17.171 15.867 16.735 15.202L13.836 10.777C13.441 10.174 12.558 10.174 12.163 10.777L9.26399 15.202C8.82799 15.867 9.30499 16.75 10.1 16.75H10.499"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M13 13.25V15.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M13 18C13.4142 18 13.75 17.6642 13.75 17.25C13.75 16.8358 13.4142 16.5 13 16.5C12.5858 16.5 12.25 16.8358 12.25 17.25C12.25 17.6642 12.5858 18 13 18Z"
          fill={fill}
          stroke="none"
        />
      </g>
    </svg>
  );
}

export function Layout({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M7.75009 2H2.75009C1.78359 2 1.00009 2.7835 1.00009 3.75V7.25C1.00009 8.2165 1.78359 9 2.75009 9H7.75009C8.71659 9 9.50009 8.2165 9.50009 7.25V3.75C9.50009 2.7835 8.71659 2 7.75009 2Z"
          fill={fill}
        />
        <path
          d="M15.2501 4H13.2501C12.2836 4 11.5001 4.7835 11.5001 5.75V12.25C11.5001 13.2165 12.2836 14 13.2501 14H15.2501C16.2166 14 17.0001 13.2165 17.0001 12.25V5.75C17.0001 4.7835 16.2166 4 15.2501 4Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M8.25009 10.5H4.75009C3.78359 10.5 3.00009 11.2835 3.00009 12.25V14.25C3.00009 15.2165 3.78359 16 4.75009 16H8.25009C9.21659 16 10.0001 15.2165 10.0001 14.25V12.25C10.0001 11.2835 9.21659 10.5 8.25009 10.5Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Sun({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9 13.25C11.3472 13.25 13.25 11.3472 13.25 9C13.25 6.65279 11.3472 4.75 9 4.75C6.65279 4.75 4.75 6.65279 4.75 9C4.75 11.3472 6.65279 13.25 9 13.25Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M9 0.75V2.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M14.834 3.16599L13.773 4.22699"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M17.25 9H15.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M14.834 14.834L13.773 13.773"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9 17.25V15.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M3.16602 14.834L4.22702 13.773"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M0.75 9H2.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M3.16602 3.16599L4.22702 4.22699"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9 13.25C11.3472 13.25 13.25 11.3472 13.25 9C13.25 6.65279 11.3472 4.75 9 4.75C6.65279 4.75 4.75 6.65279 4.75 9C4.75 11.3472 6.65279 13.25 9 13.25Z"
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

export function Settings({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M15.9391 7.44101L14.8771 7.27802C14.7531 6.85402 14.5851 6.447 14.3721 6.06L15.0081 5.19299C15.3761 4.69199 15.3241 4.00801 14.8841 3.57001L14.4281 3.11401C13.9901 2.67501 13.3071 2.62299 12.8041 2.98999L11.9371 3.62701C11.5501 3.41401 11.1431 3.24601 10.7201 3.12201L10.5561 2.05899C10.4611 1.44499 9.94208 0.998993 9.32108 0.998993H8.67609C8.05509 0.998993 7.53509 1.445 7.44109 2.06L7.27808 3.12201C6.85408 3.24601 6.44709 3.41401 6.06009 3.62701L5.19308 2.991C4.69108 2.624 4.00808 2.676 3.57008 3.116L3.11409 3.57199C2.67509 4.01099 2.62309 4.69401 2.99009 5.19601L3.62709 6.06299C3.41509 6.44999 3.24609 6.857 3.12209 7.28L2.05909 7.444C1.44509 7.539 0.999084 8.05799 0.999084 8.67899V9.32401C0.999084 9.94501 1.44509 10.465 2.06009 10.559L3.12209 10.722C3.24609 11.146 3.41409 11.553 3.62709 11.94L2.99109 12.807C2.62409 13.308 2.67609 13.991 3.11609 14.43L3.57209 14.886C4.01109 15.326 4.69508 15.378 5.19608 15.01L6.06308 14.373C6.45008 14.585 6.85709 14.754 7.28009 14.878L7.44408 15.941C7.53908 16.555 8.05808 17.001 8.67908 17.001H9.32409C9.94509 17.001 10.4651 16.555 10.5591 15.94L10.7221 14.878C11.1461 14.754 11.5531 14.586 11.9401 14.373L12.8071 15.009C13.3081 15.377 13.9911 15.324 14.4301 14.885L14.8861 14.429C15.3251 13.99 15.3771 13.307 15.0101 12.805L14.3731 11.938C14.5861 11.551 14.7541 11.144 14.8781 10.721L15.9411 10.557C16.5551 10.462 17.0011 9.94299 17.0011 9.32199V8.677C17.0011 8.056 16.5551 7.53599 15.9411 7.44199L15.9391 7.44101Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M9.00009 11.5C10.3808 11.5 11.5001 10.3807 11.5001 9C11.5001 7.61929 10.3808 6.5 9.00009 6.5C7.61938 6.5 6.50009 7.61929 6.50009 9C6.50009 10.3807 7.61938 11.5 9.00009 11.5Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Computer({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9.75 13.5H8.25V15.0244C7.12269 15.0976 6.19231 15.3241 5.52446 15.5347C5.12941 15.6593 4.91014 16.0805 5.0347 16.4755C5.15926 16.8706 5.58048 17.0898 5.97552 16.9653C6.68077 16.7429 7.72315 16.5 8.99999 16.5C9.73958 16.5 10.8063 16.5819 12.0248 16.9654C12.4199 17.0898 12.841 16.8703 12.9654 16.4752C13.0897 16.0801 12.8703 15.659 12.4752 15.5346C11.446 15.2107 10.511 15.0741 9.75 15.0244V13.5Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M3.75 2C2.23079 2 1 3.23079 1 4.75V10.75C1 12.2692 2.23079 13.5 3.75 13.5H14.25C15.7692 13.5 17 12.2692 17 10.75V4.75C17 3.23079 15.7692 2 14.25 2H3.75Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
      </g>
    </svg>
  );
}

export function Moon({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M13 11.75C9.548 11.75 6.75 8.952 6.75 5.5C6.75 4.148 7.183 2.901 7.912 1.878C4.548 2.506 2 5.453 2 9C2 13.004 5.246 16.25 9.25 16.25C12.622 16.25 15.448 13.944 16.259 10.826C15.309 11.409 14.196 11.75 13 11.75Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M13 11.75C9.548 11.75 6.75 8.952 6.75 5.5C6.75 4.148 7.183 2.901 7.912 1.878C4.548 2.506 2 5.453 2 9C2 13.004 5.246 16.25 9.25 16.25C12.622 16.25 15.448 13.944 16.259 10.826C15.309 11.409 14.196 11.75 13 11.75Z"
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

export function Logout({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M13.75 1.5H8.25C6.73122 1.5 5.5 2.73122 5.5 4.25V13.749C5.5 15.2678 6.73122 16.499 8.25 16.499H13.75C15.2688 16.499 16.5 15.2678 16.5 13.749V4.25C16.5 2.73122 15.2688 1.5 13.75 1.5Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M9.24999 8.24999H2.56049L4.03019 6.78026C4.32319 6.48726 4.32319 6.01273 4.03019 5.71983C3.73719 5.42693 3.26259 5.42683 2.96969 5.71983L0.219689 8.46983C-0.073311 8.76283 -0.073311 9.23736 0.219689 9.53026L2.96969 12.2803C3.11619 12.4268 3.30759 12.5 3.49999 12.5C3.69239 12.5 3.8838 12.4268 4.0303 12.2803C4.3233 11.9873 4.3233 11.5127 4.0303 11.2198L2.56059 9.75011H9.2501C9.6642 9.75011 10.0001 9.41421 10.0001 9.00011C10.0001 8.58601 9.66409 8.24999 9.24999 8.24999Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function ChevronUpDown({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M12.5 6.25L9 2.75L5.5 6.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M12.5 11.75L9 15.25L5.5 11.75"
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

export function Backlog({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M4.987,2.961c.778-.518,1.662-.89,2.612-1.075"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M1.879,7.631c.185-.968,.562-1.867,1.091-2.657"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M4.987,15.039c.778,.518,1.662,.89,2.612,1.075"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M1.879,10.369c.185,.968,.562,1.867,1.091,2.657"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M10.401,1.886c.95,.185,1.834,.557,2.612,1.075"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.03,4.974c.529,.79,.906,1.689,1.091,2.657"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M10.401,16.114c.95-.185,1.834-.557,2.612-1.075"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.03,13.026c.529-.79,.906-1.689,1.091-2.657"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function Done({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9.00012 17C13.4184 17 17.0001 13.4183 17.0001 9C17.0001 4.58172 13.4184 1 9.00012 1C4.58184 1 1.00012 4.58172 1.00012 9C1.00012 13.4183 4.58184 17 9.00012 17Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M8.00012 12.5C7.78822 12.5 7.58512 12.4102 7.44252 12.252L5.19252 9.752C4.91522 9.4439 4.94051 8.9698 5.24821 8.6924C5.55581 8.4155 6.02851 8.44 6.30781 8.7481L7.95622 10.5801L11.6564 5.79151C11.9103 5.46341 12.381 5.40329 12.7091 5.65669C13.0362 5.90959 13.0968 6.3808 12.8439 6.7085L8.59391 12.2085C8.45721 12.3848 8.25012 12.4912 8.02852 12.4995C8.01872 12.5 8.00982 12.5 8.00012 12.5Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Quiz({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M7.76863 1.12885C11.4751 0.354749 14.75 3.16999 14.75 6.74999C14.75 8.82737 13.6463 10.6414 12 11.6506V13L5.99996 13V11.6505C4.0676 10.4651 2.89153 8.17058 3.35019 5.66114L3.35049 5.65951C3.76531 3.41782 5.59416 1.58298 7.76863 1.12885Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
        <path
          d="M6.46967 5.71967C6.76256 5.42678 7.23744 5.42678 7.53033 5.71967L9 7.18934L10.4697 5.71967C10.7626 5.42678 11.2374 5.42678 11.5303 5.71967C11.8232 6.01256 11.8232 6.48744 11.5303 6.78033L9.75 8.56066V12H12V14.25C12 15.7692 10.7692 17 9.25 17H8.75C7.23079 17 6 15.7692 6 14.25V12H8.25V8.56066L6.46967 6.78033C6.17678 6.48744 6.17678 6.01256 6.46967 5.71967Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function Audio({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M1.25 7.5C1.66421 7.5 2 7.83579 2 8.25V9.75C2 10.1642 1.66421 10.5 1.25 10.5C0.835786 10.5 0.5 10.1642 0.5 9.75V8.25C0.5 7.83579 0.835786 7.5 1.25 7.5Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M16.25 7.5C16.6642 7.5 17 7.83579 17 8.25V9.75C17 10.1642 16.6642 10.5 16.25 10.5C15.8358 10.5 15.5 10.1642 15.5 9.75V8.25C15.5 7.83579 15.8358 7.5 16.25 7.5Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M4.25 3C4.66421 3 5 3.33579 5 3.75V14.25C5 14.6642 4.66421 15 4.25 15C3.83579 15 3.5 14.6642 3.5 14.25V3.75C3.5 3.33579 3.83579 3 4.25 3Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M7.25 5C7.66421 5 8 5.33579 8 5.75V12.25C8 12.6642 7.66421 13 7.25 13C6.83579 13 6.5 12.6642 6.5 12.25V5.75C6.5 5.33579 6.83579 5 7.25 5Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M10.25 2C10.6642 2 11 2.33579 11 2.75V15.25C11 15.6642 10.6642 16 10.25 16C9.83579 16 9.5 15.6642 9.5 15.25V2.75C9.5 2.33579 9.83579 2 10.25 2Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M13.25 5C13.6642 5 14 5.33579 14 5.75V12.25C14 12.6642 13.6642 13 13.25 13C12.8358 13 12.5 12.6642 12.5 12.25V5.75C12.5 5.33579 12.8358 5 13.25 5Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function Qrcode({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M6.75 2.75H3.75C3.19772 2.75 2.75 3.19772 2.75 3.75V6.75C2.75 7.30228 3.19772 7.75 3.75 7.75H6.75C7.30228 7.75 7.75 7.30228 7.75 6.75V3.75C7.75 3.19772 7.30228 2.75 6.75 2.75Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M14.25 2.75H11.25C10.6977 2.75 10.25 3.19772 10.25 3.75V6.75C10.25 7.30228 10.6977 7.75 11.25 7.75H14.25C14.8023 7.75 15.25 7.30228 15.25 6.75V3.75C15.25 3.19772 14.8023 2.75 14.25 2.75Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M6.75 10.25H3.75C3.19772 10.25 2.75 10.6977 2.75 11.25V14.25C2.75 14.8023 3.19772 15.25 3.75 15.25H6.75C7.30228 15.25 7.75 14.8023 7.75 14.25V11.25C7.75 10.6977 7.30228 10.25 6.75 10.25Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M6.75 2.75H3.75C3.19772 2.75 2.75 3.19772 2.75 3.75V6.75C2.75 7.30228 3.19772 7.75 3.75 7.75H6.75C7.30228 7.75 7.75 7.30228 7.75 6.75V3.75C7.75 3.19772 7.30228 2.75 6.75 2.75Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M14.25 2.75H11.25C10.6977 2.75 10.25 3.19772 10.25 3.75V6.75C10.25 7.30228 10.6977 7.75 11.25 7.75H14.25C14.8023 7.75 15.25 7.30228 15.25 6.75V3.75C15.25 3.19772 14.8023 2.75 14.25 2.75Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M6.75 10.25H3.75C3.19772 10.25 2.75 10.6977 2.75 11.25V14.25C2.75 14.8023 3.19772 15.25 3.75 15.25H6.75C7.30228 15.25 7.75 14.8023 7.75 14.25V11.25C7.75 10.6977 7.30228 10.25 6.75 10.25Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path d="M6 4.5H4.5V6H6V4.5Z" fill={fill} stroke="none" />
        <path d="M13.5 4.5H12V6H13.5V4.5Z" fill={fill} stroke="none" />
        <path d="M6 12H4.5V13.5H6V12Z" fill={fill} stroke="none" />
        <path d="M16 14.5H14.5V16H16V14.5Z" fill={fill} stroke="none" />
        <path d="M14.5 13H13V14.5H14.5V13Z" fill={fill} stroke="none" />
        <path d="M16 11.5H14.5V13H16V11.5Z" fill={fill} stroke="none" />
        <path d="M13 14.5H11V16H13V14.5Z" fill={fill} stroke="none" />
        <path d="M11 11.5H9.5V14.5H11V11.5Z" fill={fill} stroke="none" />
        <path d="M14.5 10H11V11.5H14.5V10Z" fill={fill} stroke="none" />
      </g>
    </svg>
  );
}

export function LifeRing({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9 1C4.58179 1 1 4.58168 1 9C1 13.4183 4.58179 17 9 17C13.4182 17 17 13.4183 17 9C17 4.58168 13.4182 1 9 1ZM9 6C7.34317 6 6 7.34313 6 9C6 10.6569 7.34317 12 9 12C10.6568 12 12 10.6569 12 9C12 7.34313 10.6568 6 9 6Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M6.02574 1.03538C6.95242 0.689525 7.95416 0.501038 8.99899 0.501038C10.0438 0.501038 11.0456 0.689525 11.9722 1.03538C12.3603 1.18021 12.5575 1.61219 12.4127 2.00025L11.0137 5.74924C10.9477 5.92602 10.8175 6.07144 10.6491 6.1565L10.6471 6.15751C10.46 6.25199 10.2419 6.26388 10.0457 6.19029C9.72011 6.06821 9.36821 6.00104 8.99799 6.00104C8.62695 6.00104 8.27591 6.06749 7.94979 6.18949C7.76339 6.25922 7.55692 6.252 7.37584 6.16943C7.19476 6.08686 7.05392 5.9357 6.98434 5.74924L5.58532 2.00025C5.44051 1.61219 5.63769 1.18021 6.02574 1.03538Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M15.9998 5.58635C16.3878 5.44154 16.8198 5.63872 16.9647 6.02677C17.3105 6.95345 17.499 7.95519 17.499 9.00002C17.499 10.0439 17.3105 11.0456 16.9647 11.9723C16.8198 12.3603 16.3878 12.5575 15.9998 12.4127L12.2508 11.0137C12.1501 10.9761 12.0587 10.9173 11.9827 10.8414L11.9817 10.8404C11.7737 10.6324 11.7065 10.3221 11.8098 10.0467C11.9318 9.72115 11.999 9.36924 11.999 8.99901C11.999 8.62798 11.9325 8.27693 11.8105 7.9508C11.7408 7.7644 11.748 7.55793 11.8306 7.37685C11.9132 7.19577 12.0643 7.05493 12.2508 6.98535L15.9998 5.58635Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M7.35707 11.8405C7.5433 11.7479 7.75962 11.7368 7.95436 11.8098C8.27989 11.9319 8.63179 11.999 9.00201 11.999C9.37304 11.999 9.72409 11.9326 10.0502 11.8106C10.2366 11.7408 10.4431 11.7481 10.6242 11.8306C10.8053 11.9132 10.9461 12.0644 11.0157 12.2508L12.4147 15.9998C12.5595 16.3879 12.3623 16.8198 11.9743 16.9647C11.0476 17.3105 10.0458 17.499 9.00101 17.499C7.95618 17.499 6.95444 17.3105 6.02777 16.9647C5.63971 16.8198 5.44253 16.3879 5.58734 15.9998L6.98633 12.2508C7.05286 12.0725 7.18467 11.9262 7.35506 11.8415L7.35707 11.8405Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M1.03535 6.02775C1.18018 5.6397 1.61217 5.44252 2.00023 5.58733L5.74922 6.98634C5.84872 7.02347 5.93921 7.08132 6.01468 7.15604L6.01569 7.15704C6.22565 7.36492 6.294 7.6767 6.19026 7.95335C6.06818 8.27889 6.00101 8.63079 6.00101 9.00102C6.00101 9.37206 6.06747 9.72312 6.18946 10.0492C6.25919 10.2356 6.25197 10.4421 6.1694 10.6232C6.08683 10.8043 5.93567 10.9451 5.74921 11.0147L2.00022 12.4137C1.61216 12.5585 1.18018 12.3613 1.03535 11.9733C0.689499 11.0466 0.501011 10.0448 0.501011 9.00001C0.501011 7.95613 0.689516 6.95438 1.03535 6.02775Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function Waypoints({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M8.75 4.25C8.75 3.83579 9.08579 3.5 9.5 3.5H12.875C14.6012 3.5 16 4.89879 16 6.625C16 8.35121 14.6012 9.75 12.875 9.75H5.125C4.22721 9.75 3.5 10.4772 3.5 11.375C3.5 12.2728 4.22721 13 5.125 13H8.5C8.91421 13 9.25 13.3358 9.25 13.75C9.25 14.1642 8.91421 14.5 8.5 14.5H5.125C3.39879 14.5 2 13.1012 2 11.375C2 9.64879 3.39879 8.25 5.125 8.25H12.875C13.7728 8.25 14.5 7.52279 14.5 6.625C14.5 5.72721 13.7728 5 12.875 5H9.5C9.08579 5 8.75 4.66421 8.75 4.25Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M2 4.25C2 2.73079 3.23079 1.5 4.75 1.5C6.26921 1.5 7.5 2.73079 7.5 4.25C7.5 5.76921 6.26921 7 4.75 7C3.23079 7 2 5.76921 2 4.25Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M10.5 13.75C10.5 12.2308 11.7308 11 13.25 11C14.7692 11 16 12.2308 16 13.75C16 15.2692 14.7692 16.5 13.25 16.5C11.7308 16.5 10.5 15.2692 10.5 13.75Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function CircleInfo({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9.00009 17C13.4184 17 17.0001 13.4183 17.0001 9C17.0001 4.58172 13.4184 1 9.00009 1C4.58181 1 1.00009 4.58172 1.00009 9C1.00009 13.4183 4.58181 17 9.00009 17Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M9.00009 13.5688C8.58599 13.5688 8.25009 13.2329 8.25009 12.8188V8.5C8.25009 8.0859 8.58599 7.75 9.00009 7.75C9.41419 7.75 9.75009 8.0859 9.75009 8.5V12.8188C9.75009 13.2329 9.41419 13.5688 9.00009 13.5688Z"
          fill={fill}
        />
        <path
          d="M9.00009 6.75C8.44809 6.75 8.00009 6.301 8.00009 5.75C8.00009 5.199 8.44809 4.75 9.00009 4.75C9.55209 4.75 10.0001 5.199 10.0001 5.75C10.0001 6.301 9.55209 6.75 9.00009 6.75Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Map({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M6.25 2.79144C6.15493 2.78511 6.05895 2.79229 5.965 2.813L2.533 3.576C2.076 3.677 1.75 4.083 1.75 4.552V13.004C1.75 13.644 2.342 14.119 2.967 13.98L5.965 13.314C6.05895 13.2928 6.15493 13.2856 6.25 13.2921V2.79144ZM11.75 15.2086C11.8451 15.2149 11.9411 15.2077 12.035 15.187L15.467 14.424C15.924 14.323 16.25 13.917 16.25 13.448V4.996C16.25 4.356 15.658 3.881 15.033 4.02L12.035 4.686C11.9411 4.70722 11.8451 4.7144 11.75 4.70794V15.2086Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          d="M6.25 2.792V13.292"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M11.75 4.708V15.208"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M2.533 3.576L5.965 2.813C6.151 2.772 6.345 2.784 6.524 2.849L11.476 4.65C11.655 4.715 11.849 4.728 12.035 4.686L15.033 4.02C15.658 3.881 16.25 4.356 16.25 4.996V13.448C16.25 13.917 15.924 14.323 15.467 14.424L12.035 15.187C11.849 15.228 11.655 15.216 11.476 15.151L6.524 13.35C6.345 13.285 6.151 13.272 5.965 13.314L2.967 13.98C2.342 14.119 1.75 13.644 1.75 13.004V4.552C1.75 4.083 2.076 3.677 2.533 3.576Z"
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

export function CreditCard({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M3.75 3C2.23079 3 1 4.23079 1 5.75V12.25C1 13.7692 2.23079 15 3.75 15H14.25C15.7692 15 17 13.7692 17 12.25V5.75C17 4.23079 15.7692 3 14.25 3H3.75Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
        <path d="M17 6.5H1V8H17V6.5Z" fill={fill} />
        <path
          d="M3.5 11.25C3.5 10.8358 3.83579 10.5 4.25 10.5H7.25C7.66421 10.5 8 10.8358 8 11.25C8 11.6642 7.66421 12 7.25 12H4.25C3.83579 12 3.5 11.6642 3.5 11.25Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M12 11.25C12 10.8358 12.3358 10.5 12.75 10.5H13.75C14.1642 10.5 14.5 10.8358 14.5 11.25C14.5 11.6642 14.1642 12 13.75 12H12.75C12.3358 12 12 11.6642 12 11.25Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function Megaphone({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M3 11.9648V14.1609C3 14.8782 3.43806 15.5227 4.10467 15.7872L6.049 16.5599C6.74957 16.8384 7.5469 16.6364 8.03214 16.0639L8.03376 16.062L9.35164 14.4965L7.88352 13.9113L6.88731 15.0947C6.81652 15.1776 6.70216 15.2054 6.603 15.166L4.65733 14.3927C4.56231 14.355 4.5 14.2635 4.5 14.1609V12.5627L3 11.9648Z"
          fill={fill}
        />
        <path
          d="M12.6507 2.18715C12.911 2.06909 13.1951 2 13.5 2C14.1264 2 14.665 2.29162 15.0903 2.70045C15.5119 3.10571 15.8573 3.6562 16.1311 4.27853C16.6797 5.5253 17 7.19519 17 9C17 10.8048 16.6797 12.4747 16.1311 13.7215C15.8573 14.3438 15.5119 14.8943 15.0903 15.2996C14.665 15.7084 14.1264 16 13.5 16C13.1863 16 12.8947 15.9269 12.6282 15.8025L2.33541 11.6999C1.88888 11.526 1.53954 11.1809 1.35524 10.7451C1.17819 10.3264 1 9.72921 1 8.99997C1 8.67267 1.03604 8.01796 1.34712 7.27448C1.52838 6.84316 1.87828 6.47693 2.3418 6.29833C4.15441 5.5963 5.8251 4.91971 7.50147 4.24081L7.50369 4.23991C9.16845 3.56571 10.8389 2.88922 12.6507 2.18715ZM13 7.5C13.828 7.5 14.5 8.172 14.5 9C14.5 9.828 13.828 10.5 13 10.5C12.9658 10.5 12.9329 10.4954 12.8998 10.4908C12.8816 10.4883 12.8634 10.4858 12.845 10.484C12.787 10.032 12.75 9.539 12.75 9C12.75 8.461 12.787 7.968 12.845 7.516C12.8601 7.51425 12.8751 7.51217 12.89 7.51009C12.9264 7.50502 12.9624 7.5 13 7.5Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M11.5 9C11.5 7.35301 11.7952 5.8979 12.2419 4.88262C12.4657 4.37392 12.7128 4.00913 12.9492 3.78186C13.182 3.55816 13.3669 3.5 13.5 3.5C13.6331 3.5 13.818 3.55816 14.0508 3.78186C14.2872 4.00913 14.5343 4.37392 14.7581 4.88262C15.2048 5.8979 15.5 7.35301 15.5 9C15.5 10.647 15.2048 12.1021 14.7581 13.1174C14.5343 13.6261 14.2872 13.9909 14.0508 14.2181C13.818 14.4418 13.6331 14.5 13.5 14.5C13.3669 14.5 13.182 14.4418 12.9492 14.2181C12.7128 13.9909 12.4657 13.6261 12.2419 13.1174C11.7952 12.1021 11.5 10.647 11.5 9ZM13 7.5C13.8266 7.5 14.4978 8.16975 14.5 8.99585L14.5 9C14.5 9.828 13.828 10.5 13 10.5C12.9658 10.5 12.9329 10.4954 12.8998 10.4908C12.8816 10.4883 12.8634 10.4858 12.845 10.484C12.787 10.032 12.75 9.539 12.75 9C12.75 8.461 12.787 7.968 12.845 7.516C12.8601 7.51425 12.8751 7.51217 12.89 7.51009C12.9264 7.50502 12.9624 7.5 13 7.5Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function Globe({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M9 16.25C10.6569 16.25 12 13.0041 12 9C12 4.99594 10.6569 1.75 9 1.75C7.34315 1.75 6 4.99594 6 9C6 13.0041 7.34315 16.25 9 16.25Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M1.75 9H16.25"
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

export function Organization({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M1.97301 8.00503L7 5.8085V16L5 16H3.25C2.28379 16 1.5 15.2162 1.5 14.25V8.70201C1.5 8.39472 1.68745 8.11852 1.97301 8.00503Z"
          fill={fill}
        />
        <path
          d="M7.33022 2.04249C7.5367 1.90303 7.79896 1.87522 8.03009 1.96827L16.5301 5.39027C16.814 5.50457 17 5.77994 17 6.086V14.25C17 15.2162 16.2162 16 15.25 16H7V2.664C7 2.41484 7.12374 2.18194 7.33022 2.04249Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
        <path
          d="M7.00002 5.66437L0.470017 8.29223C0.0857518 8.44686 -0.100397 8.88373 0.0542426 9.268C0.208882 9.65226 0.64575 9.83841 1.03001 9.68377L7.00002 7.28127V5.66437Z"
          fill={fill}
        />
        <path
          d="M10 16V13C10 11.8958 10.8958 11 12 11C13.1042 11 14 11.8958 14 13V16H10Z"
          fill={fill}
        />
        <path
          d="M12 9C12.5523 9 13 8.552 13 8C13 7.448 12.5523 7 12 7C11.4477 7 11 7.448 11 8C11 8.552 11.4477 9 12 9Z"
          fill={fill}
        />
        <path
          d="M7.03004 1.56623C6.64578 1.41158 6.20891 1.59771 6.05425 1.98197C5.8996 2.36623 6.08573 2.8031 6.46999 2.95776L16.97 7.18376C17.3542 7.33841 17.7911 7.15228 17.9458 6.76802C18.1004 6.38376 17.9143 5.94689 17.53 5.79223L15.5 4.97519V3.5C15.5 3.08579 15.1642 2.75 14.75 2.75C14.3358 2.75 14 3.08579 14 3.5V4.37148L7.03004 1.56623Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function CircleDashed({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M4.987 2.96099C5.765 2.44299 6.649 2.07099 7.599 1.88599"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M1.879 7.631C2.064 6.663 2.441 5.764 2.97 4.974"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M4.987 15.039C5.765 15.557 6.649 15.929 7.599 16.114"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M1.879 10.369C2.064 11.337 2.441 12.236 2.97 13.026"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M10.401 1.88599C11.351 2.07099 12.235 2.44299 13.013 2.96099"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.03 4.974C15.559 5.764 15.936 6.663 16.121 7.631"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M10.401 16.114C11.351 15.929 12.235 15.557 13.013 15.039"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.03 13.026C15.559 12.236 15.936 11.337 16.121 10.369"
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

export function CircleCheck({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M5.75 9.25L8 11.75L12.25 6.25"
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

export function HeaderIcon({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M3.75012 16H14.2501C15.7667 16 17.0001 14.7666 17.0001 13.25V5C17.0001 4.5859 16.6642 4.25 16.2501 4.25H1.75012C1.33602 4.25 1.00012 4.5859 1.00012 5V13.25C1.00012 14.7666 2.23352 16 3.75012 16Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M14.2501 2H3.75012C2.23134 2 1.00012 3.23122 1.00012 4.75V5.25C1.00012 6.76878 2.23134 8 3.75012 8H14.2501C15.7689 8 17.0001 6.76878 17.0001 5.25V4.75C17.0001 3.23122 15.7689 2 14.2501 2Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Users({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M0.554137 13.5756C1.34525 11.4759 3.36866 9.978 5.74997 9.978C8.13128 9.978 10.1547 11.4759 10.9458 13.5756C11.3059 14.5315 10.7272 15.5154 9.84596 15.8102C8.82613 16.1509 7.42657 16.477 5.75097 16.477C4.0754 16.477 2.67527 16.151 1.65458 15.8104C0.771586 15.5163 0.194851 14.5312 0.554137 13.5756Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M12.5523 13.9772C13.9847 13.9159 15.1901 13.6248 16.096 13.3222C16.9772 13.0274 17.5559 12.0435 17.1958 11.0875C16.4047 8.98793 14.3813 7.48999 12 7.48999C10.5581 7.48999 9.24737 8.03921 8.26202 8.93866C10.147 9.65809 11.6398 11.1632 12.3495 13.0467C12.4675 13.3601 12.5329 13.6723 12.5523 13.9772Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
        <path
          d="M5.75 8.50049C6.99267 8.50049 8 7.49361 8 6.25049C8 5.00736 6.99267 4.00049 5.75 4.00049C4.50733 4.00049 3.5 5.00736 3.5 6.25049C3.5 7.49361 4.50733 8.50049 5.75 8.50049Z"
          fill={fill}
        />
        <path
          d="M12 6.00049C13.2427 6.00049 14.25 4.99361 14.25 3.75049C14.25 2.50736 13.2427 1.50049 12 1.50049C10.7573 1.50049 9.75 2.50736 9.75 3.75049C9.75 4.99361 10.7573 6.00049 12 6.00049Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
      </g>
    </svg>
  );
}

export function LinkFilled({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <rect
          height="7.07332"
          width="10.1272"
          fill={secondaryfill}
          fillOpacity="0.3"
          rx="3.53666"
          stroke="none"
          transform="rotate(45 10.029 5.00841)"
          x="10.029"
          y="5.00841"
        />
        <path
          d="M8.5 6.827C8.148 6.995 7.818 7.225 7.527 7.517L7.517 7.527C6.136 8.908 6.136 11.146 7.517 12.527L9.692 14.702C11.073 16.083 13.311 16.083 14.692 14.702L14.702 14.692C16.083 13.311 16.083 11.073 14.702 9.692L13.771 8.761"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M9.5 11.173C9.852 11.005 10.182 10.775 10.473 10.483L10.483 10.473C11.864 9.092 11.864 6.854 10.483 5.473L8.308 3.298C6.927 1.917 4.689 1.917 3.308 3.298L3.298 3.308C1.917 4.689 1.917 6.927 3.298 8.308L4.229 9.239"
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

export function CircleQuestion({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <circle
          cx="9"
          cy="9"
          fill="none"
          r="7.25"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M6.925,6.619c.388-1.057,1.294-1.492,2.18-1.492,.895,0,1.818,.638,1.818,1.808,0,1.784-1.816,1.468-2.096,3.065"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M8.791,13.567c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z"
          fill={secondaryfill}
          stroke="none"
        />
      </g>
    </svg>
  );
}

export function DisableLink({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M3.25101 5.5C2.56022 5.5 2.00101 6.05921 2.00101 6.75V11.25C2.00101 11.9408 2.56022 12.5 3.25101 12.5H4.75101C5.16522 12.5 5.50101 12.8358 5.50101 13.25C5.50101 13.6642 5.16522 14 4.75101 14H3.25101C1.7318 14 0.50101 12.7692 0.50101 11.25V6.75C0.50101 5.23079 1.7318 4 3.25101 4H5.75101C7.27022 4 8.50101 5.23079 8.50101 6.75C8.50101 7.16421 8.16522 7.5 7.75101 7.5C7.3368 7.5 7.00101 7.16421 7.00101 6.75C7.00101 6.05921 6.4418 5.5 5.75101 5.5H3.25101Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M16.1069 5.10059C16.4654 4.893 16.9242 5.01529 17.1318 5.37373C17.3665 5.77901 17.501 6.24979 17.501 6.75001V11.25C17.501 12.7692 16.2702 14 14.751 14H12.251C11.0372 14 10.0091 13.2147 9.64361 12.1261C9.51176 11.7335 9.7232 11.3083 10.1159 11.1764C10.5085 11.0446 10.9337 11.256 11.0656 11.6487C11.2321 12.1445 11.7006 12.5 12.251 12.5H14.751C15.4418 12.5 16.001 11.9408 16.001 11.25V6.75001C16.001 6.52142 15.9401 6.309 15.8338 6.12548C15.6262 5.76704 15.7485 5.30818 16.1069 5.10059Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M12.251 5.5C11.5602 5.5 11.001 6.05921 11.001 6.75C11.001 7.16421 10.6652 7.5 10.251 7.5C9.83679 7.5 9.501 7.16421 9.501 6.75C9.501 5.23079 10.7318 4 12.251 4H13.251C13.6652 4 14.001 4.33579 14.001 4.75C14.001 5.16421 13.6652 5.5 13.251 5.5H12.251Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M4.25101 9C4.25101 8.58579 4.5868 8.25 5.00101 8.25H9.00101C9.41522 8.25 9.75101 8.58579 9.75101 9C9.75101 9.41421 9.41522 9.75 9.00101 9.75H5.00101C4.5868 9.75 4.25101 9.41421 4.25101 9Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M16.5313 1.46967C16.8242 1.76256 16.8242 2.23744 16.5313 2.53033L2.53134 16.5303C2.23845 16.8232 1.76357 16.8232 1.47068 16.5303C1.17779 16.2374 1.17779 15.7626 1.47068 15.4697L15.4707 1.46967C15.7636 1.17678 16.2384 1.17678 16.5313 1.46967Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function Email({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M1 5.25C1 3.73079 2.23079 2.5 3.75 2.5H14.25C15.7692 2.5 17 3.73079 17 5.25V12.75C17 14.2692 15.7692 15.5 14.25 15.5H3.75C2.23079 15.5 1 14.2692 1 12.75V5.25Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M3.75 2.5C2.23054 2.5 1 3.73203 1 5.25C1 5.52318 1.14853 5.77475 1.38773 5.9067L8.15473 9.6397C8.68119 9.93004 9.31874 9.93008 9.84519 9.63975L16.6123 5.9067C16.8515 5.77475 17 5.52318 17 5.25C17 3.73203 15.7695 2.5 14.25 2.5H3.75Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function NewEmail({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M1 5.25C1 3.73079 2.23079 2.5 3.75 2.5H14.25C15.7692 2.5 17 3.73079 17 5.25V11.628C16.7654 11.5451 16.513 11.5 16.25 11.5H16V11.25C16 10.0074 14.9926 9 13.75 9C12.5074 9 11.5 10.0074 11.5 11.25V11.5H11.25C10.0074 11.5 9 12.5074 9 13.75C9 14.4568 9.32592 15.0875 9.83567 15.5H3.75C2.23079 15.5 1 14.2692 1 12.75V5.25Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
        <path
          d="M14.5 11.25C14.5 10.8358 14.1642 10.5 13.75 10.5C13.3358 10.5 13 10.8358 13 11.25V13H11.25C10.8358 13 10.5 13.3358 10.5 13.75C10.5 14.1642 10.8358 14.5 11.25 14.5H13V16.25C13 16.6642 13.3358 17 13.75 17C14.1642 17 14.5 16.6642 14.5 16.25V14.5H16.25C16.6642 14.5 17 14.1642 17 13.75C17 13.3358 16.6642 13 16.25 13H14.5V11.25Z"
          fill={fill}
        />
        <path
          d="M16.9688 4.83458L9.84531 8.76513C9.31885 9.05549 8.68124 9.05557 8.15478 8.76521L1.03101 4.83535C1.23084 3.513 2.37171 2.5 3.74998 2.5H14.25C15.628 2.5 16.7687 3.5126 16.9688 4.83458Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Reply({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M7 3.54297C7 3.24797 6.82701 2.98001 6.55701 2.85901C6.28801 2.73801 5.973 2.78603 5.752 2.98303L0.252001 7.86804C0.0930014 8.00904 0.00200248 8.21097 2.47886e-06 8.42297C-0.00199752 8.63497 0.0870058 8.83905 0.244006 8.98205L5.74401 14.011C5.96301 14.213 6.281 14.262 6.552 14.144C6.824 14.024 7 13.457 7 13.457V3.54297Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M11 6.05102V3.54297C11 3.24797 10.827 2.98001 10.557 2.85901C10.288 2.73801 9.973 2.78603 9.752 2.98303L4.252 7.86804C4.093 8.00904 4.002 8.21097 4 8.42297C3.998 8.63497 4.08701 8.83905 4.24401 8.98205L9.74401 14.011C9.96301 14.213 10.281 14.262 10.552 14.144C10.824 14.024 11 13.755 11 13.457V11.007C14.61 11.329 16.634 13.887 16.654 13.912C16.799 14.101 17.021 14.2061 17.25 14.2061C17.333 14.2061 17.416 14.1919 17.496 14.1639C17.802 14.0579 18.005 13.768 18 13.444C18 13.372 17.812 6.52002 11 6.05102Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function FountainPen({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M0.566714 2.78069C0.85572 2.48396 1.33055 2.4777 1.62728 2.76671C2.38724 3.50689 3.4769 4.80671 3.48797 6.5011C3.49648 7.8055 2.85087 8.76662 2.35587 9.50351C2.34392 9.52131 2.33205 9.53898 2.32027 9.55653C1.78239 10.3581 1.46462 10.8788 1.52391 11.536C1.55572 11.8831 1.70709 12.4227 2.39109 13.1002C2.68537 13.3917 2.68763 13.8666 2.39614 14.1609C2.10464 14.4552 1.62978 14.4574 1.33549 14.1659C0.416108 13.2553 0.0959644 12.3924 0.0301085 11.6723C-0.0812105 10.4414 0.548151 9.50417 1.03299 8.78283C1.04702 8.76195 1.06094 8.74125 1.07471 8.72073C1.60319 7.93315 1.99329 7.32199 1.98801 6.51091C1.98108 5.4513 1.28074 4.52308 0.580697 3.84126C0.283968 3.55226 0.277707 3.07742 0.566714 2.78069Z"
          fill={fill}
          fillRule="evenodd"
        />
        <path
          d="M11.2376 3.59699C11.5102 3.50049 11.8139 3.56922 12.0183 3.77365L15.7713 7.52667C15.9757 7.73109 16.0445 8.03481 15.948 8.30733L14.356 12.8033C14.1519 13.379 13.6622 13.8093 13.06 13.9326L13.0589 13.9328L5.90398 15.4134C5.59944 15.4763 5.48606 15.1196 5.70595 14.8997L9.40744 11.1982C9.5337 11.072 9.71751 11.0292 9.89564 11.0414C9.93012 11.0438 9.96491 11.045 9.99998 11.045C10.8285 11.045 11.5 10.3731 11.5 9.54501C11.5 8.71693 10.8285 8.04501 9.99998 8.04501C9.17144 8.04501 8.49998 8.71693 8.49998 9.54501C8.49998 9.58008 8.50118 9.61487 8.50355 9.64934C8.5158 9.82748 8.47304 10.0113 8.34678 10.1376L4.64666 13.8377C4.42516 14.0592 4.06673 13.9447 4.13211 13.6384L5.61256 6.484C5.73687 5.88349 6.16574 5.39381 6.7407 5.18934L11.2376 3.59699Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
        <path
          d="M10.9657 1.76565C11.2586 1.47277 11.7334 1.47277 12.0263 1.76566L17.7783 7.51767C18.0712 7.81056 18.0712 8.28544 17.7783 8.57833L17.478 8.87865C16.7945 9.5634 15.686 9.56271 15.0027 8.87933L10.6653 4.542C9.98052 3.85855 9.98126 2.75005 10.6647 2.06665L10.9657 1.76565Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function PaperPlane({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M14.9298 1.83569C15.8387 1.51064 16.7542 2.2945 16.5796 3.24022L14.3836 15.1001C14.2158 16.0073 13.1545 16.428 12.4112 15.8781L2.30823 8.41014C1.50269 7.81474 1.68979 6.56564 2.63017 6.2289L14.9298 1.83569Z"
          fill={secondaryfill}
          fillOpacity="0.4"
          fillRule="evenodd"
        />
        <path
          d="M6.4665 11.484L4.99823 10.3987L16.151 2.19983L6.4665 11.484Z"
          fill={fill}
        />
        <path
          d="M5 10.3998V14.268C5 15.289 6.15975 15.8804 6.98634 15.2776L9.30505 13.5821L5 10.3998Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function PaperPlaneClock({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M14 17.25C15.7949 17.25 17.25 15.7949 17.25 14C17.25 12.2051 15.7949 10.75 14 10.75C12.2051 10.75 10.75 12.2051 10.75 14C10.75 15.7949 12.2051 17.25 14 17.25Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M14.4206 8.51584C14.2818 8.50534 14.1415 8.5 14 8.5C11.5033 8.5 9.39516 10.1636 8.72356 12.4428L3.00499 15.412C2.60099 15.622 2.14199 15.244 2.27199 14.807L3.99299 9L2.27199 3.193C2.14299 2.756 2.60099 2.378 3.00499 2.588L14.4206 8.51584Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          d="M8.38601 9H3.99301"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M13.918 8.254L3.00499 2.588C2.60099 2.378 2.14299 2.756 2.27199 3.193L3.99299 9L2.27199 14.807C2.14299 15.244 2.60099 15.622 3.00499 15.412L8.42999 12.595"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M14 17.25C15.7949 17.25 17.25 15.7949 17.25 14C17.25 12.2051 15.7949 10.75 14 10.75C12.2051 10.75 10.75 12.2051 10.75 14C10.75 15.7949 12.2051 17.25 14 17.25Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.156 14.476L14 14V12.75"
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

export function UserPen({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9 7.00049C10.6571 7.00049 12 5.65736 12 4.00049C12 2.34362 10.6571 1.00049 9 1.00049C7.34291 1.00049 6 2.34362 6 4.00049C6 5.65736 7.34291 7.00049 9 7.00049Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
        <path
          d="M16.943 10.2614C16.379 9.69936 15.407 9.69736 14.845 10.2574L11.656 13.4484C11.492 13.6104 11.363 13.8044 11.273 14.0264L10.643 15.5894C10.531 15.8664 10.594 16.1844 10.805 16.3974C10.949 16.5424 11.142 16.6204 11.338 16.6204C11.43 16.6204 11.522 16.6034 11.61 16.5694L13.124 15.9794C13.35 15.8914 13.551 15.7604 13.727 15.5864L16.95 12.3624C17.231 12.0814 17.386 11.7074 17.384 11.3114C17.382 10.9178 17.2208 10.5393 16.943 10.2614Z"
          fill={fill}
        />
        <path
          d="M13.1297 9.85179C11.9735 9.00263 10.5463 8.50049 8.99999 8.50049C6.14167 8.50049 3.69058 10.2162 2.60517 12.6679C2.05162 13.9191 2.74425 15.3322 4.01259 15.7318C5.29503 16.1359 6.99283 16.5005 8.99999 16.5005C9.05962 16.5005 9.11897 16.5002 9.17805 16.4995C9.03957 16.0237 9.05924 15.5057 9.25176 15.0286L9.88288 13.4628C10.0467 13.0588 10.2868 12.6935 10.5979 12.3852L13.1297 9.85179Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
      </g>
    </svg>
  );
}

export function NewQrCode({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  title = "badge 13",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 83 83"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill="none">
        <path
          d="M31.1249 39.1944H17.2916C12.8419 39.1944 9.22217 35.5747 9.22217 31.1249V17.2916C9.22217 12.8419 12.8419 9.22217 17.2916 9.22217H31.1249C35.5747 9.22217 39.1944 12.8419 39.1944 17.2916V31.1249C39.1944 35.5747 35.5747 39.1944 31.1249 39.1944ZM17.2916 16.1388C16.6553 16.1388 16.1388 16.6553 16.1388 17.2916V31.1249C16.1388 31.7613 16.6553 32.2777 17.2916 32.2777H31.1249C31.7613 32.2777 32.2777 31.7613 32.2777 31.1249V17.2916C32.2777 16.6553 31.7613 16.1388 31.1249 16.1388H17.2916Z"
          fill={fill}
        />
        <path
          d="M65.7083 39.1944H51.8749C47.4252 39.1944 43.8055 35.5747 43.8055 31.1249V17.2916C43.8055 12.8419 47.4252 9.22217 51.8749 9.22217H65.7083C70.158 9.22217 73.7777 12.8419 73.7777 17.2916V31.1249C73.7777 35.5747 70.158 39.1944 65.7083 39.1944ZM51.8749 16.1388C51.2386 16.1388 50.7221 16.6553 50.7221 17.2916V31.1249C50.7221 31.7613 51.2386 32.2777 51.8749 32.2777H65.7083C66.3446 32.2777 66.861 31.7613 66.861 31.1249V17.2916C66.861 16.6553 66.3446 16.1388 65.7083 16.1388H51.8749Z"
          fill={fill}
        />
        <path
          d="M31.1249 73.7779H17.2916C12.8419 73.7779 9.22217 70.1582 9.22217 65.7084V51.8751C9.22217 47.4254 12.8419 43.8057 17.2916 43.8057H31.1249C35.5747 43.8057 39.1944 47.4254 39.1944 51.8751V65.7084C39.1944 70.1582 35.5747 73.7779 31.1249 73.7779ZM17.2916 50.7223C16.6553 50.7223 16.1388 51.2388 16.1388 51.8751V65.7084C16.1388 66.3448 16.6553 66.8612 17.2916 66.8612H31.1249C31.7613 66.8612 32.2777 66.3448 32.2777 65.7084V51.8751C32.2777 51.2388 31.7613 50.7223 31.1249 50.7223H17.2916Z"
          fill={fill}
        />
        <path d="M27.6666 20.75H20.7499V27.6667H27.6666V20.75Z" fill={fill} />
        <path d="M62.2499 20.75H55.3333V27.6667H62.2499V20.75Z" fill={fill} />
        <path
          d="M27.6666 55.3335H20.7499V62.2502H27.6666V55.3335Z"
          fill={fill}
        />
        <path d="M49 51H44V69H49V51Z" fill={fill} />
        <path d="M54 51H49V57H54V51Z" fill={fill} />
        <path d="M70 46H49V51H70V46Z" fill={fill} />
        <path
          d="M71.9306 62.3611H66.7778V57.2083C66.7778 55.9893 65.7884 55 64.5694 55C63.3504 55 62.3611 55.9893 62.3611 57.2083V62.3611H57.2083C55.9893 62.3611 55 63.3504 55 64.5694C55 65.7884 55.9893 66.7778 57.2083 66.7778H62.3611V71.9306C62.3611 73.1496 63.3504 74.1389 64.5694 74.1389C65.7884 74.1389 66.7778 73.1496 66.7778 71.9306V66.7778H71.9306C73.1496 66.7778 74.1389 65.7884 74.1389 64.5694C74.1389 63.3504 73.1496 62.3611 71.9306 62.3611Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function Vimeo({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  title = "badge 13",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill={fill}>
        <path d="M29.236,9.481c-.125,2.731-2.028,6.47-5.711,11.216-3.807,4.958-7.028,7.436-9.662,7.436-1.632,0-3.013-1.509-4.141-4.529-.754-2.768-1.507-5.535-2.26-8.303-.838-3.018-1.736-4.529-2.697-4.529-.209,0-.942,.442-2.197,1.321l-1.317-1.7c1.382-1.217,2.745-2.433,4.086-3.651,1.843-1.596,3.227-2.435,4.149-2.519,2.179-.21,3.521,1.283,4.024,4.477,.544,3.447,.92,5.591,1.132,6.43,.628,2.86,1.319,4.288,2.074,4.288,.586,0,1.466-.928,2.64-2.782,1.173-1.855,1.801-3.267,1.885-4.236,.167-1.601-.461-2.404-1.885-2.404-.67,0-1.361,.155-2.072,.46,1.376-4.516,4.005-6.71,7.886-6.584,2.877,.085,4.233,1.954,4.068,5.609Z" />
      </g>
    </svg>
  );
}

export function Search({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  title = "badge 13",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill={fill}>
        <path
          d="M7.75 12.75C10.5114 12.75 12.75 10.5114 12.75 7.75C12.75 4.98858 10.5114 2.75 7.75 2.75C4.98858 2.75 2.75 4.98858 2.75 7.75C2.75 10.5114 4.98858 12.75 7.75 12.75Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M15.25 15.25L11.285 11.285"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M7.75 12.75C10.5114 12.75 12.75 10.5114 12.75 7.75C12.75 4.98858 10.5114 2.75 7.75 2.75C4.98858 2.75 2.75 4.98858 2.75 7.75C2.75 10.5114 4.98858 12.75 7.75 12.75Z"
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

export function Refresh({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  title = "badge 13",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill={fill}>
        <path
          d="M1.75,9c0,4.004,3.246,7.25,7.25,7.25,3.031,0,5.627-1.86,6.71-4.5"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M16.25,9c0-4.004-3.246-7.25-7.25-7.25-3.031,0-5.627,1.86-6.71,4.5"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <polyline
          fill="none"
          points="16.12 14.695 15.712 11.75 12.768 12.157"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <polyline
          fill="none"
          points="1.88 3.305 2.288 6.25 5.232 5.843"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function Save({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  title = "badge 13",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill={fill}>
        <path
          d="M5.25 15.75H4.41C3.217 15.75 2.25 14.783 2.25 13.59V4.41C2.25 3.217 3.217 2.25 4.41 2.25H5.25V5.25C5.25 5.802 5.698 6.25 6.25 6.25H9.75C10.302 6.25 10.75 5.802 10.75 5.25V2.25H11.836C12.101 2.25 12.356 2.355 12.543 2.543L15.457 5.457C15.645 5.645 15.75 5.899 15.75 6.164V13.59C15.75 14.783 14.783 15.75 13.59 15.75H12.75V10.75C12.75 10.198 12.302 9.75 11.75 9.75H6.25C5.698 9.75 5.25 10.198 5.25 10.75V15.75Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          d="M10.75 2.25V5.25C10.75 5.802 10.302 6.25 9.75 6.25H6.25C5.698 6.25 5.25 5.802 5.25 5.25V2.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M5.25 15.75V10.75C5.25 10.198 5.698 9.75 6.25 9.75H11.75C12.302 9.75 12.75 10.198 12.75 10.75V15.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M13.59 15.75H4.41C3.217 15.75 2.25 14.783 2.25 13.59V4.41C2.25 3.217 3.217 2.25 4.41 2.25H11.836C12.101 2.25 12.356 2.355 12.543 2.543L15.457 5.457C15.645 5.645 15.75 5.899 15.75 6.164V13.59C15.75 14.783 14.783 15.75 13.59 15.75Z"
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

export function Robot({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  title = "badge 13",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill={fill}>
        <line
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="2.75"
          x2="1"
          y1="11.75"
          y2="11.75"
        />
        <line
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="15.25"
          x2="17"
          y1="11.75"
          y2="11.75"
        />
        <line
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="9"
          x2="9"
          y1="3.75"
          y2="6.75"
        />
        <path
          d="m15.25,14.25c0,1.1046-.8954,2-2,2H4.75c-1.1046,0-2-.8954-2-2v-5.5c0-1.1046.8954-2,2-2h8.5c1.1046,0,2,.8954,2,2v5.5Z"
          fill={secondaryfill}
          opacity=".3"
          strokeWidth="0"
        />
        <path
          d="m8,12h2c.276,0,.5.224.5.5h0c0,.828-.672,1.5-1.5,1.5h0c-.828,0-1.5-.672-1.5-1.5h0c0-.276.224-.5.5-.5Z"
          fill={fill}
          strokeWidth="0"
        />
        <path
          d="m15.25,14.25c0,1.1046-.8954,2-2,2H4.75c-1.1046,0-2-.8954-2-2v-5.5c0-1.1046.8954-2,2-2h8.5c1.1046,0,2,.8954,2,2v5.5Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <circle cx="6" cy="11" fill={fill} r="1" strokeWidth="0" />
        <circle cx="12" cy="11" fill={fill} r="1" strokeWidth="0" />
        <circle
          cx="9"
          cy="2.25"
          fill="none"
          r="1.5"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function EmailComplained({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M1.75 5.64296L8.565 9.54C8.84 9.673 9.16 9.673 9.434 9.54L16.25 5.64239V5.25C16.25 4.14543 15.3546 3.25 14.25 3.25H3.75C2.64543 3.25 1.75 4.14543 1.75 5.25V5.64296Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          d="M1.75 5.75L8.517 9.483C8.818 9.649 9.182 9.649 9.483 9.483L16.25 5.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M16.25 9.898V5.25C16.25 4.146 15.355 3.25 14.25 3.25H3.75C2.645 3.25 1.75 4.146 1.75 5.25V12.75C1.75 13.854 2.645 14.75 3.75 14.75H6.75"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.5 16.75H15.899C16.694 16.75 17.171 15.867 16.735 15.202L13.836 10.777C13.441 10.174 12.558 10.174 12.163 10.777L9.26399 15.202C8.82799 15.867 9.30499 16.75 10.1 16.75H10.499"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M13 13.25V15.25"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M13 18C13.4142 18 13.75 17.6642 13.75 17.25C13.75 16.8358 13.4142 16.5 13 16.5C12.5858 16.5 12.25 16.8358 12.25 17.25C12.25 17.6642 12.5858 18 13 18Z"
          fill={fill}
          stroke="none"
        />
      </g>
    </svg>
  );
}

export function EmailUnsubscribed({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none">
        <path
          d="M1.75 5.64296L8.565 9.54C8.84 9.673 9.16 9.673 9.434 9.54L16.25 5.64239V5.25C16.25 4.14543 15.3546 3.25 14.25 3.25H3.75C2.64543 3.25 1.75 4.14543 1.75 5.25V5.64296Z"
          fill={fill}
          fillOpacity=".3"
          fillRule="evenodd"
        />
        <path
          d="M1.75 5.75L8.517 9.483C8.818 9.649 9.182 9.649 9.483 9.483L16.25 5.75"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M14.5 16L12 13.5L14.5 11"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M16.25 9.264V5.25C16.25 4.146 15.355 3.25 14.25 3.25H3.75C2.645 3.25 1.75 4.146 1.75 5.25V12.75C1.75 13.854 2.645 14.75 3.75 14.75H9.961"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M12.25 13.75L17.25 13.75"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function EmailBounced({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="m14.25,3.25H3.75c-1.1046,0-2,.8954-2,2v.5l6.767,3.733c.3006.1658.6654.1658.966,0l6.767-3.733v-.5c0-1.1046-.8954-2-2-2Z"
          fill={secondaryfill}
          opacity=".3"
          strokeWidth="0"
        />
        <path
          d="m1.75,5.75l6.767,3.733c.301.166.665.166.966,0l6.767-3.733"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m16.25,8.7089v-3.4589c0-1.1045-.8954-2-2-2H3.75c-1.1046,0-2,.8955-2,2v7.5c0,1.1045.8954,2,2,2h4.549"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <circle
          cx="14"
          cy="14"
          fill="none"
          r="3.25"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <line
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="11.7019"
          x2="16.2924"
          y1="16.2981"
          y2="11.7076"
        />
      </g>
    </svg>
  );
}

export function EmailOpened({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M16.25 9.73688V6.754L16.249 6.75L9.434 10.04C9.16 10.173 8.84 10.173 8.565 10.04L1.75 6.75V13.25C1.75 14.355 2.645 15.25 3.75 15.25H10.056C9.89672 14.548 10.0764 13.782 10.6042 13.2157C11.3835 12.3799 12.6502 12.2705 13.5557 12.9173L15.4602 10.3944C15.6768 10.1075 15.9488 9.88712 16.25 9.73688Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          d="M1.75 6.75001C1.75 6.02201 2.146 5.38901 2.784 5.03701L8.517 1.87401C8.818 1.70801 9.182 1.70801 9.483 1.87401L15.216 5.03701C15.854 5.38901 16.25 6.02101 16.25 6.75001"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M16.25 9.464V6.75L9.435 10.04C9.16 10.173 8.84 10.173 8.565 10.04L1.75 6.75V13.25C1.75 14.354 2.645 15.25 3.75 15.25H9.806"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M12.25 14.75L13.859 16.25L17.256 11.75"
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

export function FilledCircleQuestion({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M9.00012 17C13.4184 17 17.0001 13.4183 17.0001 9C17.0001 4.58172 13.4184 1 9.00012 1C4.58184 1 1.00012 4.58172 1.00012 9C1.00012 13.4183 4.58184 17 9.00012 17Z"
          fill={secondaryfill}
          opacity="0.4"
        />
        <path
          d="M8.82819 10.75C8.78519 10.75 8.7413 10.7466 8.6973 10.7388C8.2891 10.667 8.0166 10.2784 8.0889 9.87061C8.2744 8.81251 8.961 8.33401 9.4629 7.98441C9.9902 7.61671 10.1729 7.4624 10.1729 6.9351C10.1729 6.0982 9.47471 5.877 9.10551 5.877C8.69141 5.877 7.94831 6.0069 7.62891 6.8775C7.48631 7.2662 7.0537 7.4664 6.667 7.3233C6.2774 7.1807 6.07811 6.7501 6.22071 6.3609C6.67581 5.1187 7.75491 4.377 9.10551 4.377C10.3496 4.377 11.6729 5.2735 11.6729 6.9351C11.6729 8.2725 10.8907 8.8169 10.3204 9.2149C9.86341 9.5333 9.6407 9.7051 9.5655 10.1295C9.502 10.4938 9.18559 10.75 8.82819 10.75Z"
          fill={fill}
        />
        <path
          d="M8.79114 13.567C8.23914 13.567 7.79114 13.118 7.79114 12.567C7.79114 12.016 8.23914 11.567 8.79114 11.567C9.34314 11.567 9.79114 12.016 9.79114 12.567C9.79114 13.118 9.34314 13.567 8.79114 13.567Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function HandWave({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="m5.9266,3.3615c-.067-.388.0492-.8017.3465-1.099.4851-.4851,1.2799-.4879,1.7678,0l5.2786,5.2786-.3422-2.8426c-.0827-.6852.4101-1.3081,1.0918-1.3902s1.2268.3726,1.3902,1.0918l.7453,3.5171c.4214,1.987-.1909,4.0517-1.6263,5.4871l-1.2339,1.2339c-1.9523,1.9523-5.1187,1.9523-7.0711,0l-4.2433-4.2433c-.4879-.4879-.4851-1.2827,0-1.7678.2919-.2919.696-.4092,1.0779-.3499l-.4554-.4554c-.5353-.5353-.5353-1.4032,0-1.9384s1.4032-.5353,1.9384,0l-.8886-.8886c-.5326-.5326-.5326-1.3963,0-1.9289s1.3962-.5326,1.9289,0l.2957.2957Z"
          fill={secondaryfill}
          fillRule="evenodd"
          opacity=".3"
          strokeWidth="0"
        />
        <path
          d="m9.1015,6.8586l-3.7123-3.7123c-.4879-.4879-1.2827-.4851-1.7678,0s-.4879,1.2799,0,1.7678l3.7123,3.7123"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m4.5053,5.798c-.4879-.4879-1.2827-.4851-1.7678,0s-.4879,1.2799,0,1.7678l2.8284,2.8284"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m3.7975,8.6271c-.4879-.4879-1.2827-.4851-1.7678,0s-.4879,1.2799,0,1.7678l4.2433,4.2433c1.9523,1.9523,5.1187,1.9523,7.0711,0l1.2339-1.2339c1.4354-1.4354,2.0478-3.5002,1.6263-5.4871l-.7453-3.5171c-.1633-.7191-.7085-1.1738-1.3902-1.0918s-1.1745.705-1.0918,1.3902l.3422,2.8426-5.2786-5.2786c-.4879-.4879-1.2827-.4851-1.7678,0s-.4879,1.2799,0,1.7678"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m13.3194,7.541c-1.684.6567-2.4676,1.8203-2.3507,3.4902"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m3.75,16.25c-1.1046,0-2-.8954-2-2"
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

export function UnfilledCircleDashed({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M4.987,2.961c.778-.518,1.662-.89,2.612-1.075"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M1.879,7.631c.185-.968,.562-1.867,1.091-2.657"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M4.987,15.039c.778,.518,1.662,.89,2.612,1.075"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M1.879,10.369c.185,.968,.562,1.867,1.091,2.657"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M10.401,1.886c.95,.185,1.834,.557,2.612,1.075"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.03,4.974c.529,.79,.906,1.689,1.091,2.657"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M10.401,16.114c.95-.185,1.834-.557,2.612-1.075"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M15.03,13.026c.529-.79,.906-1.689,1.091-2.657"
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export function Podcast({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <circle cx="9" cy="8.5" fill={secondaryfill} r="2.5" />
        <path
          d="M14.5,8.5c0-3.033-2.468-5.5-5.5-5.5S3.5,5.467,3.5,8.5c0,1.21,.385,2.357,1.113,3.318,.249,.329,.718,.395,1.051,.145,.33-.25,.395-.721,.145-1.051-.529-.698-.809-1.532-.809-2.412,0-2.206,1.794-4,4-4s4,1.794,4,4c0,.88-.279,1.714-.809,2.412-.25,.33-.186,.801,.145,1.051,.136,.103,.295,.152,.452,.152,.228,0,.451-.103,.599-.297,.729-.961,1.113-2.108,1.113-3.318Z"
          fill={fill}
        />
        <path
          d="M9,0C4.313,0,.5,3.813,.5,8.5c0,2.507,1.1,4.874,3.016,6.494,.314,.267,.79,.229,1.057-.088,.268-.316,.229-.79-.088-1.057-1.579-1.335-2.484-3.284-2.484-5.349,0-3.86,3.141-7,7-7s7,3.14,7,7c0,2.064-.905,4.014-2.484,5.349-.316,.268-.355,.741-.088,1.057,.147,.175,.359,.266,.572,.266,.172,0,.344-.058,.484-.177,1.916-1.621,3.016-3.987,3.016-6.494C17.5,3.813,13.687,0,9,0Z"
          fill={fill}
        />
        <path
          d="M9.824,12h-1.648c-.64,0-1.251,.273-1.677,.75-.427,.476-.63,1.114-.559,1.748l.216,1.944c.098,.888,.845,1.558,1.739,1.558h2.209c.895,0,1.642-.669,1.739-1.557l.216-1.944c.071-.635-.132-1.272-.559-1.749-.426-.477-1.037-.75-1.677-.75Z"
          fill={secondaryfill}
        />
      </g>
    </svg>
  );
}
export function Spotify({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none">
        <path
          d="M128 0C57.308 0 0 57.309 0 128C0 198.696 57.309 256 128 256C198.697 256 256 198.696 256 128C256 57.314 198.697 0.007 127.998 0.007L127.999 0.001L128 0ZM186.699 184.614C184.406 188.374 179.484 189.566 175.724 187.258C145.671 168.901 107.839 164.743 63.284 174.923C61.2208 175.393 59.0556 175.023 57.2644 173.897C55.4732 172.771 54.2026 170.979 53.732 168.916C53.4975 167.895 53.4667 166.837 53.6415 165.804C53.8163 164.771 54.1931 163.782 54.7504 162.895C55.3077 162.008 56.0346 161.239 56.8894 160.633C57.7442 160.027 58.7102 159.595 59.732 159.363C108.492 148.223 150.315 153.019 184.055 173.639C187.815 175.947 189.007 180.854 186.699 184.614ZM202.366 149.761C199.476 154.456 193.332 155.939 188.64 153.05C154.234 131.902 101.787 125.777 61.092 138.13C55.814 139.724 50.24 136.75 48.638 131.481C47.048 126.203 50.024 120.639 55.293 119.035C101.778 104.929 159.568 111.762 199.08 136.042C203.772 138.932 205.255 145.075 202.366 149.761ZM203.711 113.468C162.457 88.964 94.394 86.71 55.007 98.666C48.682 100.584 41.993 97.013 40.077 90.688C38.16 84.36 41.727 77.676 48.057 75.753C93.27 62.027 168.434 64.68 215.929 92.876C221.631 96.252 223.495 103.6 220.117 109.281C216.755 114.971 209.387 116.846 203.717 113.468H203.711Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export function ExtraLargeText({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <line
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="7.75"
          x2="7.75"
          y1="2.75"
          y2="15.25"
        />
        <line
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="13"
          x2="2.5"
          y1="2.75"
          y2="2.75"
        />
        <line
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="13.75"
          x2="13.75"
          y1="7.25"
          y2="12.25"
        />
        <line
          fill="none"
          stroke={secondaryfill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="16.25"
          x2="11.25"
          y1="9.75"
          y2="9.75"
        />
      </g>
    </svg>
  );
}

export function PcoLogo({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 42 42"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none">
        <path
          d="M27.6964 16.2867C27.8246 16.2486 27.9533 16.3447 27.9533 16.4784V22.8131C27.9533 22.9017 27.895 22.9797 27.81 23.0049L21.2688 24.9377C21.0835 24.9925 20.8862 24.9924 20.7009 24.9374L14.19 23.005C14.1051 22.9798 14.0469 22.9018 14.0469 22.8132V16.4784C14.0469 16.3447 14.1756 16.2486 14.3038 16.2867L19.7947 17.9164C20.5801 18.1495 21.4201 18.1495 22.2055 17.9164L27.6964 16.2867Z"
          fill={fill}
        />
        <path
          d="M23.5833 0.34521C21.8908 -0.11507 20.1092 -0.11507 18.4167 0.34521L5.19168 3.94185C2.12971 4.77458 0 7.59583 0 10.8193V31.1807C0 34.4042 2.12972 37.2254 5.19169 38.0581L18.4167 41.6548C20.1092 42.1151 21.8908 42.1151 23.5833 41.6548L36.8083 38.0581C39.8703 37.2254 42 34.4042 42 31.1807V10.8193C42 7.59583 39.8703 4.77458 36.8083 3.94185L23.5833 0.34521ZM14.3037 27.1232C14.1755 27.0852 14.0468 27.1812 14.0468 27.3149V31.6921C14.0468 32.119 13.6423 32.43 13.2298 32.3203L10.483 31.5901C10.1982 31.5144 10 31.2566 10 30.962V14.4491C10 12.6983 11.7564 11.447 13.4913 11.9619L20.7008 14.1016C20.8861 14.1566 21.0834 14.1568 21.2688 14.102L28.5087 11.9619C30.2436 11.447 32 12.6983 32 14.4491V23.9239C32 25.0663 31.2275 26.0752 30.0955 26.4111L22.2054 28.7529C21.42 28.986 20.58 28.986 19.7946 28.7529L14.3037 27.1232Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function HourglassClock({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M13.5 10C11.2939 10 9.5 11.7944 9.5 14C9.5 16.2056 11.2939 18 13.5 18C15.7061 18 17.5 16.2056 17.5 14C17.5 11.7944 15.7061 10 13.5 10ZM15.8125 14.9502C15.6934 15.2398 15.4141 15.415 15.1191 15.415C15.0234 15.415 14.9277 15.3969 14.8339 15.3588L13.2148 14.6938C12.9336 14.5781 12.75 14.3042 12.75 14V12.25C12.75 11.8359 13.0859 11.5 13.5 11.5C13.9141 11.5 14.25 11.8359 14.25 12.25V13.4971L15.4043 13.9712C15.7871 14.1284 15.9707 14.5669 15.8125 14.9502Z"
          fill={fill}
        />
        <path
          d="M4.75 1.5C4.33579 1.5 4 1.83579 4 2.25C4 4.19707 4.13746 5.67043 4.56105 6.84222C4.88078 7.72668 5.35347 8.41358 5.99608 9C5.35347 9.58642 4.88078 10.2733 4.56105 11.1578C4.13746 12.3296 4 13.8029 4 15.75C4 16.1642 4.33579 16.5 4.75 16.5H8.60108C8.21685 15.7496 8 14.8998 8 14C8 11.8366 9.25356 9.96193 11.0732 9.06424C11.7158 8.47782 12.1192 7.72668 12.439 6.84222C12.8625 5.67043 13 4.19707 13 2.25C13 1.83579 12.6642 1.5 12.25 1.5H4.75Z"
          fill={secondaryfill}
          fillOpacity="0.4"
        />
        <path
          d="M8.09097 15H3.25C2.83579 15 2.5 15.3358 2.5 15.75C2.5 16.1642 2.83579 16.5 3.25 16.5H8.60108C8.36264 16.0344 8.18867 15.5304 8.09097 15Z"
          fill={fill}
        />
        <path
          d="M2.5 2.25C2.5 1.83579 2.83579 1.5 3.25 1.5H13.75C14.1642 1.5 14.5 1.83579 14.5 2.25C14.5 2.66421 14.1642 3 13.75 3H3.25C2.83579 3 2.5 2.66421 2.5 2.25Z"
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function CursorDefault({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      {...props}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
        <path
          d="M2.07 3.46299L6.451 15.293C6.802 16.241 8.145 16.235 8.487 15.284L10.113 10.767C10.222 10.463 10.462 10.224 10.766 10.114L15.283 8.48799C16.234 8.14599 16.24 6.80299 15.292 6.45199L3.463 2.06999C2.594 1.74799 1.749 2.59399 2.07 3.46299Z"
          fill={secondaryfill}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M2.07 3.46299L6.451 15.293C6.802 16.241 8.145 16.235 8.487 15.284L10.113 10.767C10.222 10.463 10.462 10.224 10.766 10.114L15.283 8.48799C16.234 8.14599 16.24 6.80299 15.292 6.45199L3.463 2.06999C2.594 1.74799 1.749 2.59399 2.07 3.46299Z"
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
