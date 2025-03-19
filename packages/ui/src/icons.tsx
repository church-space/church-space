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
