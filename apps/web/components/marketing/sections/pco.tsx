import React from "react";
import {
  Email,
  HourglassClock,
  PcoLogo,
  Waypoints,
} from "@church-space/ui/icons";
import { Badge } from "@church-space/ui/badge";

export default function PcoSection() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-bold">Designed for</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <PcoLogo width={"45"} height={"45"} fill="#2266F7" />
            <div className="absolute bottom-2 right-2 -z-10 h-[32px] w-[30px] bg-white" />
          </div>
          <svg
            width="270"
            height="45"
            className="sm:h-[60px] sm:w-[350px]"
            viewBox="0 0 237 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M25.8088 21.3871H25.4036C24.8632 21.3871 24.593 20.9806 24.458 20.5742V1.87736C24.458 1.33542 24.0527 1.06445 23.5124 1.06445H21.0808C20.5405 1.06445 20.1353 1.4709 20.1353 1.87736V22.8774C20.1353 24.3677 21.4861 25.7226 22.972 25.5871H25.6737C25.9439 25.5871 26.2141 25.3161 26.2141 25.0451V21.929C26.3491 21.658 26.079 21.3871 25.8088 21.3871Z"
              fill="currentColor"
            />
            <path
              d="M74.4389 8.10938C71.1969 8.10938 69.0359 9.73527 68.3599 10.2772L67.9549 9.05777C67.8199 8.65137 67.5499 8.51587 67.1449 8.51587H65.9289C65.3879 8.51587 64.9829 8.92238 64.9829 9.32878V24.774C64.9829 25.3159 65.3879 25.5869 65.9289 25.5869H68.2249C69.0359 25.5869 69.3059 25.3159 69.3059 24.774V14.3417C69.5759 13.6643 71.4669 11.903 74.0339 11.903C76.3299 11.903 77.5459 13.3933 77.5459 16.103V24.774C77.5459 25.3159 77.9509 25.7224 78.4919 25.5869H80.9229C81.4629 25.5869 81.8689 25.1804 81.8689 24.774V16.2385C81.8689 10.9546 79.1669 8.10938 74.4389 8.10938Z"
              fill="currentColor"
            />
            <path
              d="M203.85 21.7938C203.715 21.5229 203.58 21.3874 203.445 21.2519C203.31 21.2519 203.31 21.2519 203.175 21.2519C203.039 21.2519 202.904 21.2519 202.769 21.3874C201.959 21.7938 201.013 22.0648 200.203 22.2003C199.527 22.2003 198.852 22.0648 198.852 20.5745L198.987 12.1745H203.175C203.715 12.1745 204.12 11.768 204.12 11.3616V9.32934C204.12 8.78744 203.715 8.51644 203.31 8.51644L198.987 8.38094V3.09709C198.987 2.55515 198.582 2.28418 198.176 2.28418H195.745C195.205 2.28418 194.799 2.69063 194.799 3.09709L194.664 8.38094H193.043C192.503 8.38094 192.098 8.78744 192.098 9.19384V11.0906C192.098 11.6325 192.503 12.039 193.043 11.9035L194.799 12.039V20.71C194.799 22.8777 195.205 25.8583 199.257 25.8583C201.418 25.8583 203.985 24.7745 204.39 24.639C204.796 24.5035 205.066 24.097 204.931 23.6906V23.5551L203.85 21.7938Z"
              fill="currentColor"
            />
            <path
              d="M54.582 8.10938C51.475 8.10938 49.449 9.59977 48.503 10.2772L47.9626 9.05777C47.8275 8.65137 47.5573 8.51587 47.1521 8.51587H45.9363C45.396 8.51587 44.9907 8.92238 44.9907 9.32878V24.774C44.9907 25.3159 45.396 25.5869 45.9363 25.5869H48.233C49.043 25.5869 49.313 25.3159 49.313 24.774V14.3417C49.584 13.6643 51.475 11.903 54.041 11.903C56.338 11.903 57.554 13.3933 57.554 16.103V24.774C57.554 25.3159 57.959 25.7224 58.499 25.5869H60.931C61.471 25.5869 61.876 25.1804 61.876 24.774V16.2385C61.876 10.9546 59.175 8.10938 54.582 8.10938Z"
              fill="currentColor"
            />
            <path
              d="M36.2103 7.97461C34.1841 7.97461 32.1578 8.24551 30.1315 8.92291C29.7263 9.05841 29.4561 9.46491 29.4561 9.87131C29.4561 9.87131 29.4561 9.87131 29.4561 10.0068L29.8613 11.6326C29.8613 12.0391 30.2666 12.31 30.6719 12.4455C30.8069 12.4455 30.8069 12.4455 30.942 12.4455C32.563 12.0391 34.1841 11.7681 35.8051 11.6326C36.7507 11.6326 37.291 11.7681 37.6962 12.1746C38.2366 12.7165 38.3717 13.5294 38.2366 15.1552C37.1559 14.8842 36.0752 14.7487 34.9946 14.7487C30.8069 14.7487 27.9702 16.9165 27.9702 20.3036C27.9702 23.6907 30.2666 26.1294 33.6437 26.1294C35.67 26.1294 37.291 25.452 39.0471 24.2326L39.4523 25.181C39.5874 25.5875 39.8576 25.8584 40.2629 25.8584H41.4786C42.0189 25.8584 42.4242 25.452 42.4242 25.0455V15.9681C42.4242 11.4971 41.8839 7.97461 36.2103 7.97461ZM38.3717 20.8455C37.4261 22.0649 36.0752 22.8778 34.5893 22.8778C33.2385 22.8778 32.0227 21.7939 32.0227 20.4391C32.0227 20.3036 32.0227 20.3036 32.0227 20.1681C32.0227 18.5423 33.3736 17.4584 35.5349 17.4584C36.6156 17.4584 37.5612 17.7294 38.5068 18.1358L38.3717 20.8455Z"
              fill="currentColor"
            />
            <path
              d="M9.46371 7.16113C7.30231 7.16113 5.27611 7.97403 3.65501 9.46433L3.52001 9.59983L3.24981 8.10943C3.11471 7.83853 2.84451 7.56753 2.57441 7.70303H0.818314C0.413014 7.70303 0.0078125 7.97403 0.0078125 8.51593V33.5804C0.0078125 34.1223 0.413015 34.3933 0.953415 34.5288H3.52001C4.19541 34.5288 4.46561 34.1223 4.46561 33.5804L4.60061 25.1804C5.95151 25.9933 7.57251 26.3998 9.19351 26.3998C14.1916 26.3998 18.1091 22.1998 18.1091 16.7804C18.1091 11.3611 14.4618 7.16113 9.46371 7.16113ZM8.65321 22.7417C7.57251 22.7417 6.35671 22.4707 5.41111 21.9288C4.73571 21.6578 4.33051 20.9804 4.33051 20.1675V14.2062C4.33051 13.7998 4.46561 13.3933 4.60061 13.1223C5.54621 11.7675 7.16721 10.9546 8.78831 10.9546C11.7601 10.9546 13.7864 13.3933 13.7864 16.9159C13.9215 20.303 11.7601 22.7417 8.65321 22.7417Z"
              fill="currentColor"
            />
            <path
              d="M235.865 8.92203C235.46 8.24463 233.839 7.97363 232.623 7.97363C229.921 7.97363 228.3 9.46403 227.49 10.1414L227.085 9.05753C226.95 8.65113 226.679 8.38013 226.274 8.38013H225.058C224.518 8.38013 224.113 8.78663 224.113 9.19303V24.6382C224.113 25.1801 224.518 25.4511 225.058 25.4511H227.085C227.76 25.4511 228.3 25.3156 228.3 24.6382V13.7995C229.111 12.5801 230.597 11.7672 232.083 11.7672C232.623 11.7672 233.028 11.9027 233.569 12.0382C233.704 12.0382 233.839 12.1736 233.974 12.1736C234.244 12.1736 234.649 12.0382 234.784 11.6317L235.865 9.59953C236.135 9.46403 236 9.19303 235.865 8.92203Z"
              fill="currentColor"
            />
            <path
              d="M129.284 8.51563H127.663C127.392 8.51563 127.122 8.65113 126.987 9.05753L126.582 10.2769C125.096 8.78663 122.935 7.97363 120.908 7.97363C115.91 7.97363 112.263 12.1737 112.263 17.7285C112.263 23.2833 116.045 27.3478 121.179 27.3478C122.8 27.3478 124.421 26.9414 125.906 26.264V26.6704C126.042 27.8898 125.636 29.1091 124.691 29.922C123.61 31.1414 121.989 31.6833 119.828 31.6833C118.072 31.6833 116.451 30.8704 115.64 30.3285C115.505 30.3285 115.37 30.193 115.235 30.193C114.965 30.193 114.83 30.3285 114.694 30.464L113.749 32.3608C113.614 32.6317 113.614 33.0382 114.019 33.1737C114.559 33.5801 117.396 35.3414 120.908 35.3414H121.179C126.582 35.2059 130.364 31.8188 130.364 27.2124V9.19303C130.094 8.78663 129.689 8.51563 129.284 8.51563ZM125.906 21.1156C125.906 21.793 125.501 22.4704 124.826 22.8769C123.88 23.4188 122.664 23.6898 121.584 23.6898C118.477 23.6898 116.315 21.2511 116.315 17.864C116.315 14.3414 118.342 11.9027 121.314 11.9027C122.935 11.9027 124.556 12.7156 125.501 14.0704C125.771 14.3414 125.771 14.7478 125.771 15.1543L125.906 21.1156Z"
              fill="currentColor"
            />
            <path
              d="M152.113 20.1681C151.978 20.0326 151.708 19.8971 151.573 19.8971C151.302 19.8971 151.032 20.0326 150.897 20.1681L150.627 20.4391C149.816 21.252 148.871 22.0649 146.845 22.0649C144.143 22.0649 141.982 19.7616 141.982 16.9165C141.846 14.2068 144.143 11.9036 146.845 11.7681H146.98C148.33 11.7681 149.546 12.4455 150.492 13.3939C150.627 13.5294 150.897 13.6649 151.167 13.8004C151.437 13.8004 151.573 13.6649 151.708 13.5294L153.194 12.31C153.329 12.1746 153.464 11.9036 153.599 11.7681C153.599 11.4971 153.599 11.2262 153.464 11.0907C151.978 9.05836 149.546 7.97456 147.115 8.10996C142.117 8.10996 137.929 12.31 137.929 17.1875C137.929 22.0649 141.982 26.1294 147.115 26.1294C149.951 26.1294 152.383 24.91 153.869 22.4713C154.139 22.0649 154.004 21.5229 153.599 21.252L152.113 20.1681Z"
              fill="currentColor"
            />
            <path
              d="M163.325 7.97363C158.327 7.97363 154.544 11.9027 154.544 16.9156C154.544 22.064 158.327 25.8575 163.325 25.8575C165.756 25.8575 168.188 25.0446 169.809 23.6898C170.079 23.5543 170.214 23.2833 170.214 23.1478C170.214 22.8769 170.079 22.7414 169.944 22.4704L168.728 20.8446C168.593 20.7091 168.458 20.5736 168.188 20.5736C167.918 20.5736 167.648 20.7091 167.377 20.8446C166.297 21.6575 164.946 22.064 163.595 22.064C161.028 22.064 159.002 20.1672 158.732 17.7285H170.349C170.754 17.7285 171.16 17.322 171.16 16.9156C171.16 16.5091 171.295 16.1027 171.295 15.6962C171.43 11.4962 167.918 7.97363 163.325 7.97363ZM159.002 15.0188C159.407 12.9866 161.163 11.4962 163.325 11.4962C165.351 11.4962 166.972 13.122 167.107 15.1543L159.002 15.0188Z"
              fill="currentColor"
            />
            <path
              d="M183.587 8.10938C180.345 8.10938 178.184 9.73517 177.509 10.2772L177.103 9.05777C176.968 8.65137 176.698 8.51587 176.293 8.51587H175.077C174.537 8.51587 174.132 8.92228 174.132 9.32878V24.774C174.132 25.3159 174.537 25.5869 175.077 25.5869H177.374C178.184 25.5869 178.454 25.3159 178.454 24.774V14.3417C178.724 13.6643 180.616 11.903 183.182 11.903C185.479 11.903 186.694 13.3933 186.694 16.103V24.774C186.694 25.3159 187.1 25.7223 187.64 25.5869H190.072C190.612 25.5869 191.017 25.1804 191.017 24.774V16.2385C191.017 10.9546 188.315 8.10938 183.587 8.10938Z"
              fill="currentColor"
            />
            <path
              d="M87.2721 0.522461C85.9211 0.522461 84.7061 1.60633 84.7061 3.09665C84.7061 4.45149 85.7861 5.67084 87.2721 5.67084C88.6231 5.67084 89.8391 4.58697 89.9741 3.23213C89.9741 1.8773 88.8931 0.657941 87.5421 0.522461C87.4071 0.522461 87.4071 0.522461 87.2721 0.522461Z"
              fill="currentColor"
            />
            <path
              d="M88.6231 8.51562H86.1921C85.6511 8.51562 85.2461 8.92203 85.2461 9.32853V24.7736C85.2461 25.3156 85.6511 25.5866 86.1921 25.5866H88.6231C89.1631 25.5866 89.5691 25.1801 89.5691 24.7736V9.32853C89.5691 8.92203 89.1631 8.51562 88.6231 8.51562Z"
              fill="currentColor"
            />
            <path
              d="M102.537 8.10938C99.2948 8.10938 97.1328 9.73517 96.4578 10.2772L96.0528 9.05777C95.9178 8.65137 95.6478 8.51587 95.2418 8.51587H93.8908C93.3508 8.51587 92.9458 8.92228 92.9458 9.32878V24.774C92.9458 25.3159 93.3508 25.5869 93.8908 25.5869H96.1878C96.9978 25.5869 97.2688 25.3159 97.2688 24.774V14.3417C97.5388 13.6643 99.4298 11.903 101.997 11.903C104.293 11.903 105.509 13.3933 105.509 16.103V24.774C105.509 25.3159 105.914 25.7223 106.454 25.5869H108.886C109.426 25.5869 109.831 25.1804 109.831 24.774V16.2385C109.831 9.05778 105.239 8.10938 102.537 8.10938Z"
              fill="currentColor"
            />
            <path
              d="M214.117 7.97363C209.118 7.97363 205.336 11.9027 205.336 16.9156C205.336 22.064 209.118 25.8575 214.117 25.8575C216.548 25.8575 218.98 25.0446 220.601 23.6898C220.871 23.5543 221.006 23.2833 221.006 23.1478C221.006 22.8769 220.871 22.7414 220.736 22.4704L219.52 20.8446C219.385 20.7091 219.25 20.5736 218.98 20.5736C218.709 20.5736 218.439 20.7091 218.169 20.8446C217.088 21.6575 215.738 22.064 214.387 22.064C211.82 22.064 209.794 20.1672 209.659 17.7285H221.276C221.681 17.7285 222.087 17.322 222.087 16.9156C222.087 16.5091 222.222 16.1027 222.222 15.6962C222.222 11.4962 218.709 7.97363 214.117 7.97363ZM209.659 15.0188C210.064 12.9866 211.955 11.4962 213.981 11.4962C216.008 11.4962 217.629 13.122 217.764 15.1543L209.659 15.0188Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-1 gap-8 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1 flex flex-col gap-0 space-y-4 sm:col-span-2 sm:flex-row sm:gap-8 lg:col-span-1 lg:flex-col lg:gap-0">
          <div className="relative h-64 w-full overflow-hidden rounded-md border bg-accent shadow-sm">
            <div className="absolute bottom-0 left-0 h-56 w-[92%] rounded-bl-md rounded-tr-md border-r border-t bg-background">
              <div className="flex flex-col gap-2">
                <div className="flex w-full items-baseline border-b py-1 pl-3 text-sm font-medium text-muted-foreground">
                  Name
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="to h-6 w-6 rounded-full bg-indigo-700 bg-gradient-to-br from-blue-500" />
                    Sarah Johnson
                  </div>
                  <Badge variant="success" className="h-4 px-1.5 text-xs">
                    Subscribed
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="to h-6 w-6 rounded-full bg-emerald-600 bg-gradient-to-br from-green-400" />
                    Michael Chen
                  </div>
                  <Badge variant="success" className="h-4 px-1.5 text-xs">
                    Subscribed
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="to h-6 w-6 rounded-full bg-orange-600 bg-gradient-to-br from-amber-400" />
                    Priya Patel
                  </div>
                  <Badge variant="success" className="h-4 px-1.5 text-xs">
                    Subscribed
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="to h-6 w-6 rounded-full bg-rose-600 bg-gradient-to-br from-pink-400" />
                    James Wilson
                  </div>
                  <Badge variant="success" className="h-4 px-1.5 text-xs">
                    Subscribed
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="to h-6 w-6 rounded-full bg-cyan-600 bg-gradient-to-br from-teal-400" />
                    Maria Rodriguez
                  </div>
                  <Badge variant="success" className="h-4 px-1.5 text-xs">
                    Subscribed
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="to h-6 w-6 rounded-full bg-purple-600 bg-gradient-to-br from-violet-400" />
                    David Kim
                  </div>
                  <Badge variant="success" className="h-4 px-1.5 text-xs">
                    Subscribed
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="to h-6 w-6 rounded-full bg-green-700 bg-gradient-to-br from-lime-400" />
                    Jonathan James
                  </div>
                  <Badge variant="success" className="h-4 px-1.5 text-xs">
                    Subscribed
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">
              Sync unlimited people and lists
            </h3>
            <p className="text-sm text-muted-foreground">
              Your Planning Center people and lists are automatically synced.
              You can have as many contacts as you need.
            </p>
          </div>
        </div>
        <div className="col-span-1 space-y-4">
          <div className="relative h-64 w-full rounded-md border bg-accent shadow-sm">
            <div className="absolute bottom-0 left-1/2 h-56 w-[75%] -translate-x-1/2 overflow-hidden rounded-t-md border border-b-0 bg-background px-4 pt-4">
              <div className="mb-2 h-12 w-full rounded-lg bg-gradient-to-br from-blue-300 to-purple-500" />
              <span className="font-bold">Welcome Home</span>
              <p className="text-[10px]">
                We are so glad that you were able to join us for church this
                weekend. If you want to listen to the message again, you can
                check it out by clicking the button below.
              </p>
              <div className="my-2 flex w-full justify-center">
                <div className="rounded-md border bg-blue-400 px-1.5 py-1 text-[8px] text-white">
                  Watch Now
                </div>
              </div>
              <p className="text-[10px]">
                You can alway keep up to date with us on our social media or by
                visiting our Church Center. To download the Church Center app,
                visit churchcenter.com or search for it in the App Store.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold">
            Send beautiful emails to your lists
          </h3>
          <p className="text-sm text-muted-foreground">
            When sending an email, simply choose which Planning Center list you
            want to send to straight from Church Space.
          </p>
        </div>
        <div className="col-span-1 space-y-4">
          <div className="relative h-64 w-full rounded-md border bg-accent shadow-sm">
            <div className="absolute bottom-0 right-0 h-56 w-[92%] rounded-br-md rounded-tl-md border-l border-t bg-background">
              <div className="flex flex-col gap-2 p-2">
                <div className="w-full px-2 py-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">
                      <Waypoints height={"16"} width={"16"} />
                    </span>
                    <p>
                      When someone is added to <b>New to Church</b>
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full border-t pt-2" />
              <div className="flex flex-col gap-2 pl-2">
                <div className="w-full rounded-l border bg-accent px-2 py-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">
                      <HourglassClock height={"16"} width={"16"} />
                    </span>
                    Wait 3 hours
                  </div>
                </div>
                <div className="w-full rounded-l border bg-accent px-2 py-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">
                      <Email height={"16"} width={"16"} />
                    </span>
                    <p>
                      Send <span className="font-bold">Great to meet you</span>{" "}
                      email
                    </p>
                  </div>
                </div>
                <div className="w-full rounded-l border bg-accent px-2 py-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">
                      <HourglassClock height={"16"} width={"16"} />
                    </span>
                    Wait 5 days
                  </div>
                </div>
                <div className="w-full rounded-l border bg-accent px-2 py-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">
                      <Email height={"16"} width={"16"} />
                    </span>
                    <p>
                      Send <span className="font-bold">See you on Sunday</span>{" "}
                      email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-bold">
            Create automations connected to lists
          </h3>
          <p className="text-sm text-muted-foreground">
            Send a series of emails after a person is added to or removed from a
            Planning Center list.
          </p>
        </div>
      </div>
    </div>
  );
}
